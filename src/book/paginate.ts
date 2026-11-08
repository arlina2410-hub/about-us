import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Poem } from '../types/poem';
import { PoemPageContent } from './PoemPageContent';
import { packStanzas, type StanzaMetrics } from './pack';
import type { PageSize, PaginationResult, PoemPage } from './types';

/** Pixels kept free at the bottom of every page, so sub-pixel rounding can never clip a line. */
const SAFETY_PX = 2;
/** A one-page poem shorter than this share of the page is centred vertically. */
const CENTER_BELOW = 0.6;

interface Measurer {
  render(page: PoemPage, natural: boolean): HTMLElement;
  destroy(): void;
}

/** Hidden, off-screen page of exactly the real text-area width, using the real React component. */
function createMeasurer(size: PageSize, scale: number): Measurer {
  const host = document.createElement('div');
  host.className = 'pp-measure';
  host.setAttribute('aria-hidden', 'true');
  host.style.width = `${size.width}px`;
  host.style.setProperty('--pp-scale', String(scale));
  document.body.appendChild(host);
  const root = createRoot(host);

  return {
    render(page, natural) {
      host.style.height = natural ? 'auto' : `${size.height}px`;
      flushSync(() => root.render(createElement(PoemPageContent, { page })));
      return host;
    },
    destroy() {
      root.unmount();
      host.remove();
    },
  };
}

function draftPage(poem: Poem, index: number, stanzas: string[][]): PoemPage {
  return {
    key: `${poem.id}-${index}`,
    poemId: poem.id,
    title: poem.title,
    date: poem.date,
    category: poem.category,
    pageNumber: 0,
    indexInPoem: index,
    isFirst: index === 0,
    isLast: false,
    centered: false,
    stanzas,
  };
}

/** Height left for text once the page head (title block or running title) has taken its space. */
function bodyCapacity(m: Measurer, page: PoemPage): number {
  const body = m.render(page, false).querySelector<HTMLElement>('.pp__body');
  return body ? Math.floor(body.getBoundingClientRect().height) - SAFETY_PX : 0;
}

/** Real position of every line, after the browser has wrapped long lines. */
function measureStanzas(m: Measurer, poem: Poem): { stanzas: StanzaMetrics[]; gap: number } {
  const host = m.render(draftPage(poem, 0, poem.stanzas), true);
  const stanzaEls = Array.from(host.querySelectorAll<HTMLElement>('.pp__stanza'));
  const gap =
    stanzaEls.length > 1 ? parseFloat(getComputedStyle(stanzaEls[0]).marginBottom) || 0 : 0;

  const stanzas = stanzaEls.map((el, i) => {
    const rects = Array.from(el.querySelectorAll<HTMLElement>('.pp__line')).map((l) =>
      l.getBoundingClientRect(),
    );
    return {
      lines: poem.stanzas[i],
      tops: rects.map((r) => r.top),
      bottoms: rects.map((r) => r.bottom),
    };
  });
  return { stanzas, gap };
}

function paginatePoem(m: Measurer, poem: Poem): PoemPage[] {
  const firstCapacity = bodyCapacity(m, draftPage(poem, 0, []));
  const nextCapacity = bodyCapacity(m, draftPage(poem, 1, []));
  const { stanzas, gap } = measureStanzas(m, poem);

  const { pages, usedOnLastPage } = packStanzas(stanzas, { gap, firstCapacity, nextCapacity });
  const centered = pages.length === 1 && usedOnLastPage <= firstCapacity * CENTER_BELOW;

  return pages.map((chunk, i) => ({
    ...draftPage(poem, i, chunk),
    isLast: i === pages.length - 1,
    centered,
  }));
}

async function waitForFonts(): Promise<void> {
  if (!('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load('400 18px Newsreader'),
      document.fonts.load('400 24px Tanker'),
      document.fonts.ready,
    ]);
  } catch {
    /* measure with fallback fonts rather than failing */
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}

/**
 * Lays every poem out into pages for the given text-area size and text scale.
 * Call it again whenever the size or the text scale changes.
 */
export async function paginateBook(
  poems: Poem[],
  size: PageSize,
  scale = 1,
  signal?: AbortSignal,
): Promise<PaginationResult> {
  await waitForFonts();
  throwIfAborted(signal);

  const m = createMeasurer(size, scale);
  const pages: PoemPage[] = [];
  const errors: PaginationResult['errors'] = [];

  try {
    for (let i = 0; i < poems.length; i++) {
      throwIfAborted(signal);
      try {
        pages.push(...paginatePoem(m, poems[i]));
      } catch (e) {
        errors.push({
          poemId: poems[i]?.id ?? `index-${i}`,
          message: e instanceof Error ? e.message : String(e),
        });
      }
      // Let the browser breathe every few poems so a big collection never freezes the screen.
      if (i % 10 === 9) await new Promise<void>((r) => setTimeout(r, 0));
    }
  } finally {
    m.destroy();
  }

  const startPageByPoemId: Record<string, number> = {};
  pages.forEach((p, i) => {
    p.pageNumber = i + 1;
    if (p.isFirst) startPageByPoemId[p.poemId] = p.pageNumber;
  });

  return { pages, startPageByPoemId, errors };
}
