import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Poem } from '../types/poem';
import { useBookmarks, useReadingPosition, useSettings } from '../lib/stores';
import { paginateBook } from './paginate';
import { computeBookSize, sameLayout, type BookLayout } from './layout';
import { buildBook, type BuiltBook } from './buildBook';
import { FlipBook, type FlipBookHandle } from './FlipBook';
import { ContentsSheet } from './ContentsSheet';
import { ReadingSheet } from './ReadingSheet';
import { BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, ListIcon, TextSizeIcon } from './icons';
import './book.css';

interface BookState {
  built: BuiltBook;
  layout: BookLayout;
  startIndex: number;
}

/** Where the reader is, in terms that survive re-pagination: which poem, and how far through it. */
interface Anchor {
  poemId: string;
  fraction: number;
}

/** Size of an element, updated shortly after resizing stops. */
function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: number | undefined;
    const read = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    read();
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(read, 180);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [ref]);
  return size;
}

function anchorAt(built: BuiltBook | undefined, index: number): Anchor | null {
  const meta = built?.meta[index] ?? built?.meta[index + 1] ?? null;
  if (!meta) return null;
  return { poemId: meta.poemId, fraction: meta.pagesInPoem > 1 ? meta.indexInPoem / (meta.pagesInPoem - 1) : 0 };
}

function pickStartIndex(built: BuiltBook, anchor: Anchor | null, previousIndex: number): number {
  if (anchor) {
    const info = built.poemInfo[anchor.poemId];
    if (info) return info.first + Math.round(anchor.fraction * (info.count - 1));
  }
  return Math.min(previousIndex, built.frontCount - 1);
}

function pageLabel(book: BookState | null, index: number): string {
  if (!book) return '';
  const { frontCount, poemPageCount } = book.built;
  if (index === 0) return 'Tap the cover to open';
  if (index < frontCount) return 'ABOUT US';
  // In a spread the left page always has an odd index.
  const left = book.layout.spread && index % 2 === 0 ? index - 1 : index;
  const first = left - frontCount + 1;
  if (first > poemPageCount) return 'The end';
  if (book.layout.spread && first < poemPageCount) return `Pages ${first}\u2013${first + 1} of ${poemPageCount}`;
  return `Page ${first} of ${poemPageCount}`;
}

interface Props {
  poems: Poem[];
  /** Open the book at this poem instead of at the cover. */
  initialPoemId?: string;
  /** Open the book where this reader stopped last time. */
  resume?: boolean;
  onClose(): void;
}

export default function BookReader({ poems, initialPoemId, resume = false, onClose }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<FlipBookHandle>(null);
  const size = useElementSize(stageRef);

  const [settings, updateSettings] = useSettings();
  const bookmarks = useBookmarks();
  const [savedPosition, savePosition] = useReadingPosition();

  const [layout, setLayout] = useState<BookLayout | null>(null);
  const [book, setBook] = useState<BookState | null>(null);
  const [index, setIndex] = useState(0);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const [initialAnchor] = useState<Anchor | null>(() => {
    if (resume && savedPosition) return { poemId: savedPosition.poemId, fraction: savedPosition.fraction };
    if (initialPoemId) return { poemId: initialPoemId, fraction: 0 };
    return null;
  });
  const indexRef = useRef(0);
  const anchorRef = useRef<Anchor | null>(initialAnchor);
  const bookRef = useRef<BookState | null>(null);

  const poemsById = useMemo(() => new Map(poems.map((p) => [p.id, p])), [poems]);
  const textScale = settings.textScale;

  // Remember where the reader is, a moment after they stop turning pages (and once more on leaving).
  const savePositionRef = useRef(savePosition);
  useEffect(() => {
    savePositionRef.current = savePosition;
  });
  const pendingPosition = useRef<Anchor | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const rememberPosition = useCallback((a: Anchor | null) => {
    if (!a) return;
    pendingPosition.current = a;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      if (pendingPosition.current) savePositionRef.current(pendingPosition.current);
      pendingPosition.current = null;
    }, 500);
  }, []);
  useEffect(
    () => () => {
      window.clearTimeout(saveTimer.current);
      if (pendingPosition.current) savePositionRef.current(pendingPosition.current);
    },
    [],
  );

  // 1. Pick the book size from the free screen area (only changes when the size really changes).
  useEffect(() => {
    if (!size) return;
    const next = computeBookSize(size.w, size.h);
    setLayout((prev) => (prev && sameLayout(prev, next) ? prev : next));
  }, [size]);

  // 2. Lay the poems out for that size and text size, and build the pages. Keeps the reader's place.
  useEffect(() => {
    if (!layout || poems.length === 0) return;
    const controller = new AbortController();

    paginateBook(poems, { width: layout.textWidth, height: layout.textHeight }, textScale, controller.signal)
      .then((result) => {
        if (result.pages.length === 0) {
          setFailed(true);
          return;
        }
        const built = buildBook(result, layout, textScale);
        const startIndex = pickStartIndex(built, anchorRef.current, indexRef.current);
        const next: BookState = { built, layout, startIndex };
        indexRef.current = startIndex;
        bookRef.current = next;
        rememberPosition(anchorAt(built, startIndex));
        setFailed(false);
        setBook(next);
        setIndex(startIndex);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.error(e);
        setFailed(true);
      });

    return () => controller.abort();
  }, [poems, layout, textScale, rememberPosition]);

  const handlePageChange = useCallback(
    (i: number) => {
      indexRef.current = i;
      setIndex(i);
      const anchor = anchorAt(bookRef.current?.built, i);
      anchorRef.current = anchor;
      rememberPosition(anchor);
    },
    [rememberPosition],
  );

  // While the book is open the page itself must never scroll, bounce or pull-to-refresh, or flipping stutters on phones.
  useEffect(() => {
    document.documentElement.classList.add('is-reading');
    return () => document.documentElement.classList.remove('is-reading');
  }, []);

  // 3. Keyboard: arrows turn pages, Escape closes the book.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (contentsOpen || optionsOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') flipRef.current?.next();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') flipRef.current?.prev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [contentsOpen, optionsOpen, onClose]);

  const total = book?.built.specs.length ?? 0;
  const progress =
    book && total > 1 ? Math.min(1, (index + (book.layout.spread && index > 0 ? 1 : 0)) / (total - 1)) : 0;
  const label = pageLabel(book, index);

  const currentAnchor = book ? anchorAt(book.built, index) : null;
  const currentPoem = currentAnchor ? (poemsById.get(currentAnchor.poemId) ?? null) : null;
  const saved = currentPoem ? bookmarks.has(currentPoem.id) : false;

  const handlePick = (poemId: string) => {
    const info = book?.built.poemInfo[poemId];
    if (info) flipRef.current?.goTo(info.first);
    setContentsOpen(false);
  };

  return (
    <div className="reader" data-theme={settings.theme}>
      <header className="reader__bar">
        <button className="reader__btn reader__btn--icon" onClick={onClose} aria-label="Close the book">
          <CloseIcon />
        </button>
        <span className="reader__brand">ABOUT US</span>
        <div className="reader__tools">
          <button
            className="reader__btn reader__btn--icon"
            aria-pressed={saved}
            disabled={!currentPoem}
            onClick={() => currentPoem && bookmarks.toggle(currentPoem.id)}
            aria-label={currentPoem ? `Bookmark ${currentPoem.title}` : 'Bookmark this poem'}
          >
            <BookmarkIcon filled={saved} />
          </button>
          <button
            className="reader__btn reader__btn--icon"
            onClick={() => setOptionsOpen(true)}
            disabled={!book}
            aria-label="Reading options"
          >
            <TextSizeIcon />
          </button>
          <button
            className="reader__btn reader__btn--icon"
            onClick={() => setContentsOpen(true)}
            disabled={!book}
            aria-label="Open contents"
          >
            <ListIcon />
          </button>
        </div>
      </header>

      <div className="reader__stage" ref={stageRef}>
        {poems.length === 0 && <p className="reader__status">No poems have been added yet.</p>}
        {failed && <p className="reader__status">Something went wrong while laying out the poems. Please reload.</p>}
        {!book && poems.length > 0 && !failed && <p className="reader__status">Preparing the pages…</p>}
        {book && (
          <FlipBook
            ref={flipRef}
            pages={book.built.specs}
            pageWidth={book.layout.pageWidth}
            pageHeight={book.layout.pageHeight}
            spread={book.layout.spread}
            startIndex={book.startIndex}
            reducedMotion={reducedMotion}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <footer className="reader__controls">
        <button className="reader__btn reader__btn--icon" onClick={() => flipRef.current?.prev()} disabled={!book || index === 0} aria-label="Previous page">
          <ChevronLeftIcon />
        </button>
        <div className="reader__counter">
          {currentPoem && <span className="reader__poem">{currentPoem.title}</span>}
          <span aria-live="polite">{label}</span>
          <div className="reader__progress" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
        <button className="reader__btn reader__btn--icon" onClick={() => flipRef.current?.next()} disabled={!book} aria-label="Next page">
          <ChevronRightIcon />
        </button>
      </footer>

      {contentsOpen && book && (
        <ContentsSheet
          poems={poems}
          startPages={Object.fromEntries(
            Object.entries(book.built.poemInfo).map(([id, info]) => [id, info.first - book.built.frontCount + 1]),
          )}
          onPick={handlePick}
          onClose={() => setContentsOpen(false)}
        />
      )}

      {optionsOpen && (
        <ReadingSheet settings={settings} onChange={updateSettings} poem={currentPoem} onClose={() => setOptionsOpen(false)} />
      )}
    </div>
  );
}
