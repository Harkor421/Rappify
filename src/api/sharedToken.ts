import { SHARED_TOKEN_GIST } from "../config";
import type { RappiCredentials } from "../types/rappi";

interface SharedPayload extends RappiCredentials {
  updated_at?: string;
}

export interface SharedCredentials {
  creds: RappiCredentials;
  updated_at: string | null;
}

function rawUrl(): string {
  const { owner, id, filename } = SHARED_TOKEN_GIST;
  // Cache-bust per minute so a refresh published by one client propagates
  // within ~60s, without spamming GitHub's CDN.
  const bucket = Math.floor(Date.now() / 60_000);
  return `https://gist.githubusercontent.com/${owner}/${id}/raw/${filename}?t=${bucket}`;
}

function isValid(payload: unknown): payload is SharedPayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.authorization === "string" &&
    typeof p.deviceid === "string" &&
    typeof p.app_version === "string"
  );
}

export async function fetchSharedCredentials(): Promise<SharedCredentials | null> {
  if (!SHARED_TOKEN_GIST.id) return null;
  try {
    const res = await fetch(rawUrl(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!isValid(data)) return null;
    return {
      creds: {
        authorization: data.authorization,
        deviceid: data.deviceid,
        app_version: data.app_version,
      },
      updated_at: data.updated_at ?? null,
    };
  } catch {
    return null;
  }
}

export async function publishSharedCredentials(creds: RappiCredentials): Promise<boolean> {
  const { id, filename, writeToken } = SHARED_TOKEN_GIST;
  if (!id || !writeToken) return false;
  const payload: SharedPayload = { ...creds, updated_at: new Date().toISOString() };
  try {
    const res = await fetch(`https://api.github.com/gists/${id}`, {
      method: "PATCH",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${writeToken}`,
        "content-type": "application/json",
        "x-github-api-version": "2022-11-28",
      },
      body: JSON.stringify({
        files: { [filename]: { content: JSON.stringify(payload, null, 2) } },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
