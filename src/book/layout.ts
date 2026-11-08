export interface BookLayout {
  /** Two pages side by side (desktop/tablet) or one page (phone). */
  spread: boolean;
  pageWidth: number;
  pageHeight: number;
  marginX: number;
  marginTop: number;
  marginBottom: number;
  /** Size of the text area inside the margins. This is what the paginator lays poems out into. */
  textWidth: number;
  textHeight: number;
}

const PAGE_RATIO = 0.68; // page width / page height, like a trade paperback
const MAX_PAGE_WIDTH = 540; // keeps lines a comfortable length on big screens
const MIN_SPREAD_PAGE_WIDTH = 300; // below this, show one page instead of two

/** Chooses the biggest book that fits the free screen area. Called again whenever the area changes. */
export function computeBookSize(availableWidth: number, availableHeight: number): BookLayout {
  const w = Math.max(availableWidth - 24, 200);
  const h = Math.max(availableHeight - 16, 300);
  const byHeight = h * PAGE_RATIO;

  const spreadPageWidth = Math.min(w / 2, byHeight, MAX_PAGE_WIDTH);
  const spread = w >= 760 && spreadPageWidth >= MIN_SPREAD_PAGE_WIDTH;

  const pageWidth = Math.max(Math.floor(spread ? spreadPageWidth : Math.min(w, byHeight, MAX_PAGE_WIDTH)), 220);
  const pageHeight = Math.floor(pageWidth / PAGE_RATIO);

  const marginX = Math.round(Math.min(Math.max(pageWidth * 0.09, 20), 48));
  const marginTop = Math.round(pageWidth * 0.1);
  const marginBottom = Math.round(pageWidth * 0.13);

  return {
    spread,
    pageWidth,
    pageHeight,
    marginX,
    marginTop,
    marginBottom,
    textWidth: pageWidth - marginX * 2,
    textHeight: pageHeight - marginTop - marginBottom,
  };
}

export function sameLayout(a: BookLayout, b: BookLayout): boolean {
  // Ignore tiny changes (for example a phone's address bar sliding away) so the book is not rebuilt mid-flip.
  return a.spread === b.spread && Math.abs(a.pageWidth - b.pageWidth) <= 6 && Math.abs(a.pageHeight - b.pageHeight) <= 9;
}
