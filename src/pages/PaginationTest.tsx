import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import poemsData from '../data/poems.json';
import type { Poem } from '../types/poem';
import { paginateBook } from '../book/paginate';
import type { PaginationResult } from '../book/types';
import { PoemPageContent } from '../book/PoemPageContent';
import './pagination-test.css';

const basePoems = poemsData as unknown as Poem[];

const longLine =
  'This is an intentionally long line of verse that has to wrap onto a second and even a third row on a narrow page';

/** Extra poems that try to break the layout: one line, a wrapping title, long lines, one giant stanza. */
const stressPoems: Poem[] = [
  { id: 'stress-one-line', title: 'One Line', date: '2026-01-01', stanzas: [['Just one line.']] },
  {
    id: 'stress-long',
    title: 'A Very Long Poem With A Title That Wraps Onto Several Lines',
    date: '2026-01-02',
    category: 'Test',
    stanzas: Array.from({ length: 14 }, (_, s) =>
      Array.from({ length: 5 }, (_, l) => `Stanza ${s + 1}, line ${l + 1}: ${longLine}`),
    ),
  },
  {
    id: 'stress-giant-stanza',
    title: 'One Giant Stanza',
    date: '2026-01-03',
    stanzas: [Array.from({ length: 45 }, (_, l) => `Line ${l + 1} of a single huge stanza`)],
  },
];

interface View {
  result: PaginationResult;
  width: number;
  height: number;
  scale: number;
}

export default function PaginationTest() {
  const [width, setWidth] = useState(340);
  const [height, setHeight] = useState(520);
  const [scale, setScale] = useState(1);
  const [withStress, setWithStress] = useState(true);
  const [view, setView] = useState<View | null>(null);
  const [clipped, setClipped] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const poems = useMemo(() => (withStress ? [...basePoems, ...stressPoems] : basePoems), [withStress]);

  useEffect(() => {
    const controller = new AbortController();
    paginateBook(poems, { width, height }, scale, controller.signal)
      .then((result) => setView({ result, width, height, scale }))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === 'AbortError')) console.error(e);
      });
    return () => controller.abort();
  }, [poems, width, height, scale]);

  // Self-check: after rendering, make sure no page has text running past its box.
  useEffect(() => {
    if (!view || !gridRef.current) return;
    const bad: string[] = [];
    gridRef.current.querySelectorAll<HTMLElement>('[data-page-key]').forEach((fig) => {
      const body = fig.querySelector<HTMLElement>('.pp__body');
      if (!body) return;
      if (body.scrollHeight > body.clientHeight + 1 || body.scrollWidth > body.clientWidth + 1) {
        bad.push(fig.dataset.pageKey ?? '?');
      }
    });
    setClipped(bad);
  }, [view]);

  const pagesPerPoem = useMemo(() => {
    const counts = new Map<string, number>();
    view?.result.pages.forEach((p) => counts.set(p.poemId, (counts.get(p.poemId) ?? 0) + 1));
    return poems.map((p) => ({ id: p.id, title: p.title, pages: counts.get(p.id) ?? 0 }));
  }, [view, poems]);

  return (
    <main className="pt">
      <h1>Stage 2: page layout test</h1>
      <p>Change the page size or text size. Every poem must re-flow with no clipped text.</p>

      <div className="pt__controls">
        <label>
          Page width: {width}px
          <input type="range" min={240} max={460} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
        </label>
        <label>
          Page height: {height}px
          <input type="range" min={360} max={720} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
        </label>
        <label>
          Text size
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
            {[0.9, 1, 1.15, 1.3].map((s) => (
              <option key={s} value={s}>
                {Math.round(s * 100)}%
              </option>
            ))}
          </select>
        </label>
        <label className="pt__check">
          <input type="checkbox" checked={withStress} onChange={(e) => setWithStress(e.target.checked)} />
          Add stress-test poems
        </label>
      </div>

      {view ? (
        <>
          <p className={clipped.length ? 'pt__status pt__status--bad' : 'pt__status'}>
            {view.result.pages.length} pages from {poems.length} poems.{' '}
            {clipped.length === 0 ? 'No clipped text.' : `${clipped.length} page(s) have clipped text (red outline).`}
            {view.result.errors.length > 0 && ` ${view.result.errors.length} poem(s) skipped: see console.`}
          </p>
          <ul className="pt__counts">
            {pagesPerPoem.map((p) => (
              <li key={p.id}>
                {p.title}: {p.pages} {p.pages === 1 ? 'page' : 'pages'}
              </li>
            ))}
          </ul>

          <div className="pt__grid" ref={gridRef}>
            {view.result.pages.map((page) => (
              <figure
                key={page.key}
                data-page-key={page.key}
                className={`pt__page${clipped.includes(page.key) ? ' is-clipped' : ''}`}
                style={{ width: view.width, height: view.height, '--pp-scale': view.scale } as CSSProperties}
              >
                <PoemPageContent page={page} />
                <figcaption>{page.pageNumber}</figcaption>
              </figure>
            ))}
          </div>
        </>
      ) : (
        <p className="pt__status">Laying out pages…</p>
      )}
    </main>
  );
}
