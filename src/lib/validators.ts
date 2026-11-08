/** Pure checks for everything saved on the reader's device. Bad or old data falls back to safe defaults. */

export const SCALES = [0.9, 1, 1.15, 1.3, 1.5] as const;

export type ThemeName = 'light' | 'sepia' | 'dark';

export interface Settings {
  theme: ThemeName;
  textScale: number;
}

export const DEFAULT_SETTINGS: Settings = { theme: 'light', textScale: 1 };

export function validateSettings(v: unknown): Settings | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  const theme: ThemeName = o.theme === 'sepia' || o.theme === 'dark' || o.theme === 'light' ? o.theme : DEFAULT_SETTINGS.theme;
  const textScale =
    typeof o.textScale === 'number' && (SCALES as readonly number[]).includes(o.textScale)
      ? o.textScale
      : DEFAULT_SETTINGS.textScale;
  return { theme, textScale };
}

export function validateBookmarks(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null;
  return v.filter((x): x is string => typeof x === 'string').slice(0, 5000);
}

export interface ReadingPosition {
  poemId: string;
  /** 0 = first page of the poem, 1 = last page of the poem. */
  fraction: number;
}

export function validatePosition(v: unknown): ReadingPosition | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.poemId !== 'string' || o.poemId === '') return null;
  const f = typeof o.fraction === 'number' && Number.isFinite(o.fraction) ? Math.min(1, Math.max(0, o.fraction)) : 0;
  return { poemId: o.poemId, fraction: f };
}

/** Next smaller (-1) or larger (+1) text size, staying inside the allowed steps. */
export function stepScale(current: number, dir: 1 | -1): number {
  const list = SCALES as readonly number[];
  const at = list.indexOf(current);
  const base = at === -1 ? list.indexOf(1) : at;
  return list[Math.min(list.length - 1, Math.max(0, base + dir))];
}
