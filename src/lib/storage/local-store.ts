export type StorageErrorCode = "UNAVAILABLE" | "PARSE_ERROR" | "QUOTA_EXCEEDED";

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: StorageErrorCode; details?: unknown };

const STORAGE_PREFIX = "ai-chess:saves";

function getStorage(): { ok: true; storage: Storage } | { ok: false } {
  if (typeof window === "undefined") return { ok: false };
  try {
    if (!window.localStorage) return { ok: false };
    return { ok: true, storage: window.localStorage };
  } catch {
    return { ok: false };
  }
}

function ns(key: string): string {
  return `${STORAGE_PREFIX}:${key}`;
}

function parseJson<T>(raw: string): StorageResult<T> {
  try {
    return { ok: true, value: JSON.parse(raw) as T };
  } catch (error) {
    return { ok: false, error: "PARSE_ERROR", details: error };
  }
}

export function storageGet<T>(key: string): StorageResult<T | undefined> {
  const handle = getStorage();
  if (!handle.ok) return { ok: false, error: "UNAVAILABLE" };
  const raw = handle.storage.getItem(ns(key));
  if (raw === null) return { ok: true, value: undefined };
  return parseJson<T>(raw);
}

export function storageSet<T>(key: string, value: T): StorageResult<void> {
  const handle = getStorage();
  if (!handle.ok) return { ok: false, error: "UNAVAILABLE" };
  try {
    const serialized = JSON.stringify(value);
    handle.storage.setItem(ns(key), serialized);
    return { ok: true, value: undefined };
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014);
    return { ok: false, error: isQuota ? "QUOTA_EXCEEDED" : "UNAVAILABLE", details: error };
  }
}

export function storageRemove(key: string): StorageResult<void> {
  const handle = getStorage();
  if (!handle.ok) return { ok: false, error: "UNAVAILABLE" };
  try {
    handle.storage.removeItem(ns(key));
    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, error: "UNAVAILABLE", details: error };
  }
}

export function storageListKeys(): StorageResult<string[]> {
  const handle = getStorage();
  if (!handle.ok) return { ok: false, error: "UNAVAILABLE" };
  try {
    const keys: string[] = [];
    for (let i = 0; i < handle.storage.length; i += 1) {
      const key = handle.storage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}:`)) {
        keys.push(key.slice(STORAGE_PREFIX.length + 1));
      }
    }
    return { ok: true, value: keys };
  } catch (error) {
    return { ok: false, error: "UNAVAILABLE", details: error };
  }
}

export function storageClearNamespace(): StorageResult<void> {
  const keysResult = storageListKeys();
  if (!keysResult.ok) return keysResult;
  for (const key of keysResult.value) {
    storageRemove(key);
  }
  return { ok: true, value: undefined };
}
