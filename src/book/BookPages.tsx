import type { CSSProperties, ReactNode } from 'react';
import type { BookLayout } from './layout';

/** A small botanical sprig, drawn in code so there is no image to download. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 100" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M30 98C30 70 30 40 30 8" />
      <path d="M30 82C16 78 9 66 11 55C24 57 32 68 30 82Z" />
      <path d="M30 66C44 62 51 50 49 39C36 41 28 52 30 66Z" />
      <path d="M30 48C18 44 12 34 14 24C25 26 32 35 30 48Z" />
      <path d="M30 34C40 30 45 22 44 14C35 16 29 23 30 34Z" />
    </svg>
  );
}

export function Cover({ pageWidth }: { pageWidth: number }) {
  return (
    <div className="cover" style={{ '--pw': `${pageWidth}px` } as CSSProperties}>
      <div className="cover__frame">
        <Sprig className="cover__sprig" />
        <h1 className="cover__title" aria-label="About us">
          <span aria-hidden="true">ABOUT</span>
          <span aria-hidden="true">US</span>
        </h1>
        <span className="cover__rule" aria-hidden="true" />
        <p className="cover__sub">poems and memories</p>
      </div>
    </div>
  );
}

export function BackCover({ pageWidth }: { pageWidth: number }) {
  return (
    <div className="cover" style={{ '--pw': `${pageWidth}px` } as CSSProperties}>
      <div className="cover__frame">
        <Sprig className="cover__sprig" />
        <p className="cover__sub">thank you for reading</p>
      </div>
    </div>
  );
}

export function Endpaper({ plain = false }: { plain?: boolean }) {
  return <div className={`endpaper${plain ? ' endpaper--plain' : ''}`} />;
}

export function TitlePage({ layout }: { layout: BookLayout }) {
  return (
    <div
      className="titlepage"
      style={{ '--pw': `${layout.pageWidth}px`, padding: `${layout.marginTop}px ${layout.marginX}px ${layout.marginBottom}px` } as CSSProperties}
    >
      <Sprig className="titlepage__sprig" />
      <h2 className="titlepage__title">ABOUT US</h2>
      <span className="titlepage__rule" aria-hidden="true" />
      <p className="titlepage__sub">A personal collection of poems and memories</p>
    </div>
  );
}

/** Paper page: puts the poem text exactly inside the text area the paginator measured. */
export function PageShell({
  layout,
  scale,
  number,
  children,
}: {
  layout: BookLayout;
  scale: number;
  number: number;
  children: ReactNode;
}) {
  return (
    <div className="bp" style={{ '--pp-scale': scale } as CSSProperties}>
      <div
        className="bp__text"
        style={{ left: layout.marginX, top: layout.marginTop, width: layout.textWidth, height: layout.textHeight }}
      >
        {children}
      </div>
      <span className="bp__num" style={{ bottom: Math.round(layout.marginBottom * 0.38) }}>
        {number}
      </span>
    </div>
  );
}
