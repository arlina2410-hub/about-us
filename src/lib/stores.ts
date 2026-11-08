import { useCallback, useSyncExternalStore } from 'react';
import { getStored, setStored, subscribeStored } from './storage';
import {
  DEFAULT_SETTINGS,
  validateBookmarks,
  validatePosition,
  validateSettings,
  type ReadingPosition,
  type Settings,
} from './validators';

const NO_BOOKMARKS: string[] = [];
const validatePositionOrNull = (v: unknown) => (v === null ? null : validatePosition(v));

function useStored<T>(key: string, fallback: T, validate: (v: unknown) => T | null) {
  const subscribe = useCallback((cb: () => void) => subscribeStored(key, cb), [key]);
  const getSnapshot = useCallback(() => getStored(key, fallback, validate), [key, fallback, validate]);
  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

/** Reading theme and text size. */
export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const settings = useStored('settings', DEFAULT_SETTINGS, validateSettings);
  const update = useCallback((patch: Partial<Settings>) => {
    const current = getStored('settings', DEFAULT_SETTINGS, validateSettings);
    setStored('settings', validateSettings({ ...current, ...patch }) ?? DEFAULT_SETTINGS);
  }, []);
  return [settings, update];
}

/** Bookmarked poem ids. */
export function useBookmarks() {
  const ids = useStored('bookmarks', NO_BOOKMARKS, validateBookmarks);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback((id: string) => {
    const current = getStored('bookmarks', NO_BOOKMARKS, validateBookmarks);
    setStored('bookmarks', current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);
  return { ids, has, toggle };
}

/** Where the reader stopped: which poem and how far through it. */
export function useReadingPosition(): [ReadingPosition | null, (p: ReadingPosition) => void] {
  const position = useStored<ReadingPosition | null>('position', null, validatePositionOrNull);
  const save = useCallback((p: ReadingPosition) => setStored('position', p), []);
  return [position, save];
}
