import { FALLBACK_CREDENTIALS } from "../config";
import type { RappiCredentials } from "../types/rappi";

const CREDS_KEY = "rappify:credentials";
const AUTH_ENDPOINT = "https://services.grability.rappi.com/ms/application-user/auth";

export function getCredentials(): RappiCredentials | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw) as RappiCredentials;
  } catch {
    /* fall through */
  }
  return FALLBACK_CREDENTIALS;
}

export function saveCredentials(creds: RappiCredentials): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
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
 */
export async function refreshToken(): Promise<RappiCredentials | null> {
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
  if (refreshed && refreshed.trim()) {
    const next: RappiCredentials = {
      ...current,
      authorization: refreshed.startsWith("Bearer ") ? refreshed : `Bearer ${refreshed}`,
    };
    saveCredentials(next);
    return next;
  }
  return current;
}
