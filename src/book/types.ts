export interface PageSize {
  /** Width of the text area of one page, in px (inside the page margins). */
  width: number;
  /** Height of the text area of one page, in px (inside the page margins). */
  height: number;
}

/** One page of poem text, ready to render with <PoemPageContent />. */
export interface PoemPage {
  key: string;
  poemId: string;
  title: string;
  date?: string;
  category?: string;
  /** 1-based number across the whole book (poem pages only). */
  pageNumber: number;
  /** 0 = first page of the poem. */
  indexInPoem: number;
  isFirst: boolean;
  isLast: boolean;
  /** Short poem that fits on one page: its text is centred vertically. */
  centered: boolean;
  /** Lines on this page, grouped by stanza. A stanza can be split across pages. */
  stanzas: string[][];
}

export interface PaginationResult {
  pages: PoemPage[];
  /** poem id -> page number where the poem starts (for the table of contents). */
  startPageByPoemId: Record<string, number>;
  /** Poems that could not be laid out; they are skipped instead of crashing the book. */
  errors: { poemId: string; message: string }[];
}
