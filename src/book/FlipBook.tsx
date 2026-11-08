import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { PageFlip } from 'page-flip';

export interface BookPageSpec {
  key: string;
  /** Cover pages are stiff ("hard") and turn like a board; paper pages bend. */
  hard?: boolean;
  node: ReactNode;
}

export interface FlipBookHandle {
  next(): void;
  prev(): void;
  goTo(index: number): void;
}

interface Props {
  pages: BookPageSpec[];
  pageWidth: number;
  pageHeight: number;
  spread: boolean;
  startIndex: number;
  reducedMotion: boolean;
  onPageChange(index: number): void;
}

/**
 * Wraps StPageFlip. The library moves page elements around the DOM, so React must not own them:
 * every page gets its own tiny React root, and the whole book is rebuilt when pages or size change.
 */
export const FlipBook = forwardRef<FlipBookHandle, Props>(function FlipBook(props, ref) {
  const { pages, pageWidth, pageHeight, spread } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);

  // Values read only while building, so changing them must not rebuild the book.
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });

  useImperativeHandle(
    ref,
    () => ({
      next: () => flipRef.current?.flipNext(),
      prev: () => flipRef.current?.flipPrev(),
      goTo: (index: number) => flipRef.current?.flip(index),
    }),
    [],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let teardown = () => {};

    void (async () => {
      // Leave React's commit phase first: flushSync is not allowed inside it.
      await Promise.resolve();
      if (cancelled) return;

      const { startIndex, reducedMotion } = latest.current;
      // Phones and tablets use touch: lighter shadows and no hover "page corner" effect keep the flip smooth.
      const touch = window.matchMedia('(pointer: coarse)').matches;

      const stage = document.createElement('div');
      stage.className = `flipbook__stage${spread ? ' flipbook--spread' : ''}`;
      stage.style.width = `${spread ? pageWidth * 2 : pageWidth}px`;
      stage.style.height = `${pageHeight}px`;
      host.appendChild(stage);

      const roots: Root[] = [];
      const elements = pages.map((spec) => {
        const el = document.createElement('div');
        el.className = 'book-page';
        if (spec.hard) el.dataset.density = 'hard';
        stage.appendChild(el);
        const root = createRoot(el);
        flushSync(() => root.render(spec.node));
        roots.push(root);
        return el;
      });

      const flip = new PageFlip(stage, {
        width: pageWidth,
        height: pageHeight,
        size: 'fixed',
        usePortrait: true,
        showCover: true,
        startPage: Math.min(Math.max(startIndex, 0), pages.length - 1),
        drawShadow: true,
        maxShadowOpacity: touch ? 0.35 : 0.5,
        flippingTime: reducedMotion ? 250 : touch ? 750 : 900,
        showPageCorners: !reducedMotion && !touch,
        swipeDistance: 20,
        clickEventForward: true,
        useMouseEvents: true,
        // false: the book owns every touch inside it, so the browser never starts scrolling or pulling to refresh
        // in the middle of a page turn (that was the cause of the stutter on phones).
        mobileScrollSupport: false,
      });
      flip.loadFromHTML(elements);
      flip.on('flip', (e) => latest.current.onPageChange(e.data as number));
      flipRef.current = flip;

      teardown = () => {
        flipRef.current = null;
        try {
          flip.destroy();
        } catch {
          /* already gone */
        }
        stage.remove();
        // Unmounting a root during React's own cleanup is not allowed, so do it a moment later.
        setTimeout(() => roots.forEach((r) => r.unmount()), 0);
      };
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [pages, pageWidth, pageHeight, spread]);

  return <div className="flipbook" ref={hostRef} />;
});
