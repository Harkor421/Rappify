interface Entry<T> {
  v: T;
  t: number;
}

const PREFIX = "rappify:";

export function cacheGet<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.t > ttlMs) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return entry.v;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T): void {
  try {
    const entry: Entry<T> = { v: value, t: Date.now() };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    pruneOldest();
    try {
      const entry: Entry<T> = { v: value, t: Date.now() };
      localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch {
      /* give up */
    }
  }
}

export function cacheDelete(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export function cacheClear(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

function pruneOldest(): void {
  let oldestKey: string | null = null;
  let oldestT = Infinity;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(PREFIX)) continue;
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const entry = JSON.parse(raw) as Entry<unknown>;
      if (entry.t < oldestT) {
        oldestT = entry.t;
        oldestKey = k;
      }
    } catch {
      localStorage.removeItem(k);
    }
  }
  if (oldestKey) localStorage.removeItem(oldestKey);
}
