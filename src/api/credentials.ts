import { FALLBACK_CREDENTIALS } from "../config";
import type { RappiCredentials } from "../types/rappi";
import { fetchSharedCredentials, publishSharedCredentials } from "./sharedToken";

const CREDS_KEY = "rappify:credentials";
const AUTH_ENDPOINT = "https://services.grability.rappi.com/ms/application-user/auth";

interface StoredCreds extends RappiCredentials {
  saved_at?: string;
}

// In-memory cache of the latest credentials seen on the shared gist.
// Hydrated once at boot via hydrateSharedCredentials(); subsequent reads
// from getCredentials() prefer this over the bundled FALLBACK_CREDENTIALS
// so a token refresh by one client propagates to all clients.
let sharedDefault: RappiCredentials | null = null;
let sharedUpdatedAt: string | null = null;
let hydrationPromise: Promise<void> | null = null;

export function hydrateSharedCredentials(): Promise<void> {
  if (!hydrationPromise) {
    hydrationPromise = fetchSharedCredentials().then((remote) => {
      if (remote) {
        sharedDefault = remote.creds;
        sharedUpdatedAt = remote.updated_at;
      }
    });
  }
  return hydrationPromise;
}

export function ensureSharedCredentialsReady(): Promise<void> {
  return hydrateSharedCredentials();
}

function defaultCredentials(): RappiCredentials {
  return sharedDefault ?? FALLBACK_CREDENTIALS;
}

function ts(value: string | null | undefined): number {
  if (!value) return 0;
  const n = Date.parse(value);
  return Number.isFinite(n) ? n : 0;
}

export function getCredentials(): RappiCredentials | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as StoredCreds;
      // If the shared gist has been updated more recently than the user's
      // local override, the shared value wins. This lets the admin push a
      // new token via the gist and have non-tech-savvy users pick it up
      // automatically, even if they once tapped Save in the modal with
      // an old token.
      if (sharedDefault && ts(sharedUpdatedAt) > ts(stored.saved_at)) {
        return sharedDefault;
      }
      return {
        authorization: stored.authorization,
        deviceid: stored.deviceid,
        app_version: stored.app_version,
      };
    }
  } catch {
    /* fall through */
  }
  return defaultCredentials();
}

export function saveCredentials(creds: RappiCredentials): void {
  const stored: StoredCreds = { ...creds, saved_at: new Date().toISOString() };
  localStorage.setItem(CREDS_KEY, JSON.stringify(stored));
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDS_KEY);
}

export function hasCredentials(): boolean {
  const c = getCredentials();
  return !!(c?.authorization && c?.deviceid);
}

function applicationId(version: string): string {
  const v = version.startsWith("v") || /^[a-f0-9]{20,}$/i.test(version) ? version : `v${version}`;
  return `rappi-home-web/${v}`;
}

export function buildHeaders(creds: RappiCredentials): Record<string, string> {
  return {
    accept: "application/json",
    "accept-language": "es-CO",
    "app-version": creds.app_version,
    "app-version-name": creds.app_version,
    authorization: creds.authorization,
    "content-type": "application/json; charset=UTF-8",
    deviceid: creds.deviceid,
    needappsflyerid: "false",
    vendor: "rappi",
    "x-application-id": applicationId(creds.app_version),
  };
}

/**
 * Calls /ms/application-user/auth. The endpoint exposes X-Refresh-Token via CORS;
 * when present, we adopt it as the new Bearer token. Returns the credentials in
 * use after the call (refreshed or original), or null if the call failed/expired.
 *
 * Concurrent callers share the same in-flight promise so 168 parallel brand
 * fetches all hitting a 401 only trigger one refresh, not 168.
 */
let refreshInFlight: Promise<RappiCredentials | null> | null = null;

export function refreshToken(): Promise<RappiCredentials | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = doRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

// Filters out the X-Refresh-Token "flag" the gateway returns on 401 — the
// value is literally the string "true" (or "false"), not a bearer. A real
// Rappi token is ~400 chars and starts with "ft.". Without this guard the
// app would have happily saved `Bearer true` and locked the user out.
function isRealBearer(value: string | null): value is string {
  if (!value) return false;
  const stripped = value.replace(/^Bearer\s+/i, "").trim();
  return stripped.startsWith("ft.") && stripped.length >= 100;
}

async function doRefresh(): Promise<RappiCredentials | null> {
  const current = getCredentials();
  if (!current?.authorization || !current?.deviceid) return null;
  let res: Response;
  try {
    res = await fetch(AUTH_ENDPOINT, { method: "GET", headers: buildHeaders(current) });
  } catch {
    return null;
  }
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) return null;
  const refreshed = res.headers.get("X-Refresh-Token") || res.headers.get("x-refresh-token");
  if (isRealBearer(refreshed)) {
    const next: RappiCredentials = {
      ...current,
      authorization: refreshed.startsWith("Bearer ") ? refreshed : `Bearer ${refreshed}`,
    };
    saveCredentials(next);
    sharedDefault = next;
    // Fire-and-forget: push to shared gist so other clients pick it up
    // on their next boot (or within ~60s cache-bust window).
    void publishSharedCredentials(next);
    return next;
  }
  return current;
}

/**
 * Proactive token refresh. Keeps the bearer alive while anyone uses the app
 * within its TTL: refreshes on boot, every 10 min on a timer, and whenever
 * the tab regains focus / visibility (covers users coming back after a
 * while). A 60s cooldown prevents back-to-back refreshes.
 *
 * Idempotent — calling twice is a no-op. Returns a teardown function for
 * tests / hot-reload.
 */
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const REFRESH_COOLDOWN_MS = 60 * 1000;
let autoRefreshStarted = false;
let lastRefreshAttempt = 0;

export function startTokenAutoRefresh(): () => void {
  if (autoRefreshStarted || typeof window === "undefined") return () => {};
  autoRefreshStarted = true;

  const tryRefresh = (): void => {
    if (Date.now() - lastRefreshAttempt < REFRESH_COOLDOWN_MS) return;
    lastRefreshAttempt = Date.now();
    void refreshToken();
  };

  const intervalId = setInterval(tryRefresh, REFRESH_INTERVAL_MS);
  const onFocus = (): void => tryRefresh();
  const onVisibility = (): void => {
    if (document.visibilityState === "visible") tryRefresh();
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibility);

  // Initial refresh on boot — bundled fallback / cached gist value may be
  // hours or days old; one cheap GET makes sure we start with a fresh one.
  tryRefresh();

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibility);
    autoRefreshStarted = false;
  };
}
