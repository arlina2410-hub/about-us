/**
 * Tiny localStorage layer. Never throws: if the browser blocks storage (private mode, full disk),
 * values are kept in memory for the session instead. Changes are announced to listeners, and
 * changes made in another tab arrive through the "storage" event.
 */
const PREFIX = 'aboutus:v1:';

const memory = new Map<string, string>();
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    const v = window.localStorage.getItem(PREFIX + key);
    if (v !== null) return v;
  } catch {
    /* storage blocked */
  }
  return memory.get(key) ?? null;
}

function writeRaw(key: string, raw: string): void {
  memory.set(key, raw);
  try {
    window.localStorage.setItem(PREFIX + key, raw);
  } catch {
    /* blocked or full: the in-memory copy still works for this session */
  }
}

/** Returns the same object until the stored text changes, which is what React needs from a snapshot. */
export function getStored<T>(key: string, fallback: T, validate: (v: unknown) => T | null): T {
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;

  let value = fallback;
  if (raw !== null) {
    try {
      const parsed = validate(JSON.parse(raw));
      if (parsed !== null) value = parsed;
    } catch {
      /* damaged data: use the fallback */
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function setStored<T>(key: string, value: T): void {
  writeRaw(key, JSON.stringify(value));
  listeners.get(key)?.forEach((cb) => cb());
}

export function subscribeStored(key: string, cb: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PREFIX + key || e.key === null) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    set.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}
