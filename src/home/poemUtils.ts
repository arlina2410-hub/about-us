import type { Poem } from '../types/poem';

/** Lower-case and strip accents so "Café" matches "cafe". */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Newest first by publication date; poems with the same date fall back to id order. */
export function sortByNewest(poems: Poem[]): Poem[] {
  return [...poems].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.id.localeCompare(a.id));
}

export function latestPoems(poems: Poem[], count = 8): Poem[] {
  return sortByNewest(poems).slice(0, count);
}

/** The newest poem marked "featured": true, or the newest poem if none is marked. */
export function pickFeatured(poems: Poem[]): Poem | null {
  const sorted = sortByNewest(poems);
  return sorted.find((p) => p.featured) ?? sorted[0] ?? null;
}

/** First few non-empty lines of a poem, for cards. */
export function excerpt(poem: Poem, lines = 4): string[] {
  return (poem.stanzas ?? [])
    .flat()
    .filter((l) => l.trim() !== '')
    .slice(0, lines);
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Stable colour choice (0 to 3) so a category always gets the same card colour. */
export function toneFor(key: string): number {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return sum % 4;
}

export interface Facet {
  label: string;
  count: number;
}

/** Filter chips: categories first, then tags. Built from the poems, so new ones appear on their own. */
export function buildFacets(poems: Poem[]): Facet[] {
  const map = new Map<string, { label: string; count: number; isCategory: boolean }>();
  for (const p of poems) {
    const seen = new Set<string>();
    const add = (raw: string | undefined, isCategory: boolean) => {
      const label = raw?.trim();
      if (!label) return;
      const key = normalize(label);
      if (seen.has(key)) return;
      seen.add(key);
      const current = map.get(key);
      if (current) {
        current.count += 1;
        current.isCategory = current.isCategory || isCategory;
      } else {
        map.set(key, { label, count: 1, isCategory });
      }
    };
    add(p.category, true);
    p.tags?.forEach((t) => add(t, false));
  }
  return [...map.values()]
    .sort((a, b) => Number(b.isCategory) - Number(a.isCategory) || b.count - a.count || a.label.localeCompare(b.label))
    .map(({ label, count }) => ({ label, count }));
}

export function matchesFacet(poem: Poem, label: string): boolean {
  const key = normalize(label);
  return normalize(poem.category ?? '') === key || (poem.tags ?? []).some((t) => normalize(t) === key);
}

/** Builds a search function over titles, poem text, categories and tags. Every word typed must match. */
export function makeSearcher(poems: Poem[]) {
  const sorted = sortByNewest(poems);
  const index = new Map<string, string>();
  for (const p of sorted) {
    index.set(p.id, normalize([p.title, p.category ?? '', ...(p.tags ?? []), ...(p.stanzas ?? []).flat()].join(' \n ')));
  }
  return (query: string, facet: string | null): Poem[] => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return sorted.filter(
      (p) => (!facet || matchesFacet(p, facet)) && tokens.every((t) => (index.get(p.id) ?? '').includes(t)),
    );
  };
}
