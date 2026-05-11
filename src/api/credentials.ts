import { FALLBACK_CREDENTIALS } from "../config";
import type { RappiCredentials } from "../types/rappi";

const CREDS_KEY = "rappify:credentials";

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
  };
}
