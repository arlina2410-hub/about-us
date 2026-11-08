/**
 * Pure page-packing logic (no DOM). Takes measured stanzas and decides which
 * lines go on which page. Kept separate so it can be tested without a browser.
 */

export interface StanzaMetrics {
  lines: string[];
  /** Top of each line in px (any shared origin). */
  tops: number[];
  /** Bottom of each line in px (same origin as tops). */
  bottoms: number[];
}

export interface PackOptions {
  /** Space between two stanzas, px. */
  gap: number;
  /** Height available for text on the first page of the poem (below the title), px. */
  firstCapacity: number;
  /** Height available for text on continuation pages, px. */
  nextCapacity: number;
  /** Fewest lines allowed to stay at the bottom of a page when a stanza splits. */
  minOrphan?: number;
  /** Fewest lines allowed to be carried to the top of the next page. */
  minWidow?: number;
}

export interface PackResult {
  pages: string[][][];
  /** Height used on the last page, px. */
  usedOnLastPage: number;
}

export function packStanzas(stanzas: StanzaMetrics[], opts: PackOptions): PackResult {
  const { gap, firstCapacity, nextCapacity } = opts;
  const minOrphan = opts.minOrphan ?? 2;
  const minWidow = opts.minWidow ?? 2;

  const pages: string[][][] = [[]];
  let used = 0;
  let capacity = firstCapacity;

  const startNewPage = () => {
    pages.push([]);
    used = 0;
    capacity = nextCapacity;
  };
  // Height of lines [from, to) of a stanza.
  const span = (s: StanzaMetrics, from: number, to: number) => s.bottoms[to - 1] - s.tops[from];

  for (const s of stanzas) {
    const total = s.lines.length;
    if (total === 0) continue;
    let from = 0;

    while (from < total) {
      const page = pages[pages.length - 1];
      const isEmpty = page.length === 0;
      const gapBefore = isEmpty ? 0 : gap;
      const room = capacity - used - gapBefore;

      // 1. Everything that is left of this stanza fits here.
      if (span(s, from, total) <= room) {
        page.push(s.lines.slice(from));
        used += gapBefore + span(s, from, total);
        break;
      }

      // 2. Poets keep stanzas whole: if it fits on a fresh page, move it there.
      if (!isEmpty && from === 0 && span(s, 0, total) <= nextCapacity) {
        startNewPage();
        continue;
      }

      // 3. Otherwise split the stanza between lines.
      let fit = 0;
      while (from + fit < total && span(s, from, from + fit + 1) <= room) fit++;

      const left = total - from;
      if (left >= minOrphan + minWidow) {
        if (left - fit < minWidow) fit = left - minWidow; // never leave a lone last line
        if (fit < minOrphan) fit = 0; // never leave a lone first line
      }
      if (fit === 0) {
        if (!isEmpty) {
          startNewPage();
          continue;
        }
        fit = 1; // an empty page must always make progress
      }

      page.push(s.lines.slice(from, from + fit));
      used += gapBefore + span(s, from, from + fit);
      from += fit;
      if (from < total) startNewPage();
    }
  }

  return {
    pages: pages.length > 1 ? pages.filter((p) => p.length > 0) : pages,
    usedOnLastPage: used,
  };
}
