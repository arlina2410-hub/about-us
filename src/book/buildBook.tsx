import type { BookLayout } from './layout';
import type { BookPageSpec } from './FlipBook';
import type { PaginationResult } from './types';
import { PoemPageContent } from './PoemPageContent';
import { BackCover, Cover, Endpaper, PageShell, TitlePage } from './BookPages';

export interface PageMeta {
  poemId: string;
  indexInPoem: number;
  pagesInPoem: number;
}

export interface BuiltBook {
  specs: BookPageSpec[];
  /** Same length as specs: poem info for poem pages, null for cover, endpapers, etc. */
  meta: (PageMeta | null)[];
  /** Pages before the first poem (cover, endpaper, title page). */
  frontCount: number;
  poemPageCount: number;
  /** poem id -> index in specs of its first page, and how many pages it has. */
  poemInfo: Record<string, { first: number; count: number }>;
}

/** Cover + front matter + every poem page + back matter, with an even page count so the back cover stands alone. */
export function buildBook(result: PaginationResult, layout: BookLayout, scale: number): BuiltBook {
  const specs: BookPageSpec[] = [];
  const meta: (PageMeta | null)[] = [];
  const add = (spec: BookPageSpec, m: PageMeta | null = null) => {
    specs.push(spec);
    meta.push(m);
  };

  add({ key: 'cover', hard: true, node: <Cover pageWidth={layout.pageWidth} /> });
  add({ key: 'endpaper-front', node: <Endpaper /> });
  add({ key: 'title-page', node: <TitlePage layout={layout} /> });
  const frontCount = specs.length;

  const counts: Record<string, number> = {};
  result.pages.forEach((p) => {
    counts[p.poemId] = (counts[p.poemId] ?? 0) + 1;
  });

  const poemInfo: BuiltBook['poemInfo'] = {};
  result.pages.forEach((p) => {
    if (p.isFirst) poemInfo[p.poemId] = { first: specs.length, count: counts[p.poemId] };
    add(
      {
        key: p.key,
        node: (
          <PageShell layout={layout} scale={scale} number={p.pageNumber}>
            <PoemPageContent page={p} />
          </PageShell>
        ),
      },
      { poemId: p.poemId, indexInPoem: p.indexInPoem, pagesInPoem: counts[p.poemId] },
    );
  });

  if (specs.length % 2 !== 0) add({ key: 'blank', node: <Endpaper plain /> });
  add({ key: 'endpaper-back', node: <Endpaper /> });
  add({ key: 'back-cover', hard: true, node: <BackCover pageWidth={layout.pageWidth} /> });

  return { specs, meta, frontCount, poemPageCount: result.pages.length, poemInfo };
}
