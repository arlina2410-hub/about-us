import { useEffect, useMemo, useState, type RefObject } from 'react';
import type { Poem } from '../types/poem';
import { BookmarkIcon } from '../book/icons';
import { SearchIcon } from './icons';
import { buildFacets, excerpt, formatShortDate, makeSearcher } from './poemUtils';

const PAGE_SIZE = 30;
/** Special filter value for "Saved"; it can never clash with a real category or tag. */
const SAVED = '\u0000saved';

interface Props {
  poems: Poem[];
  /** Ids of bookmarked poems. */
  savedIds: string[];
  inputRef: RefObject<HTMLInputElement | null>;
}

/** Search box, category/tag chips, saved poems and the full list of poems. */
export function BrowseSection({ poems, savedIds, inputRef }: Props) {
  const [query, setQuery] = useState('');
  const [facet, setFacet] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);

  const search = useMemo(() => makeSearcher(poems), [poems]);
  const facets = useMemo(() => buildFacets(poems), [poems]);
  // Bookmarks of poems that no longer exist are ignored.
  const savedSet = useMemo(() => {
    const existing = new Set(poems.map((p) => p.id));
    return new Set(savedIds.filter((id) => existing.has(id)));
  }, [poems, savedIds]);

  const results = useMemo(
    () => (facet === SAVED ? search(query, null).filter((p) => savedSet.has(p.id)) : search(query, facet)),
    [search, query, facet, savedSet],
  );

  useEffect(() => setShown(PAGE_SIZE), [query, facet]);
  // If the last bookmark is removed while "Saved" is selected, go back to all poems.
  useEffect(() => {
    if (facet === SAVED && savedSet.size === 0) setFacet(null);
  }, [facet, savedSet]);

  const visible = results.slice(0, shown);

  return (
    <section className="browse" id="all-poems" aria-labelledby="browse-heading">
      <h2 id="browse-heading" className="section-title">
        All poems
      </h2>

      <label className="search">
        <SearchIcon />
        <span className="sr-only">Search poems by title or text</span>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search titles or lines"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>

      <div className="chips" role="group" aria-label="Filter by category, tag or saved">
        <button className="chip" aria-pressed={facet === null} onClick={() => setFacet(null)}>
          All
        </button>
        {savedSet.size > 0 && (
          <button
            className="chip chip--saved"
            aria-pressed={facet === SAVED}
            onClick={() => setFacet(facet === SAVED ? null : SAVED)}
          >
            <BookmarkIcon filled /> Saved <span className="chip__count">{savedSet.size}</span>
          </button>
        )}
        {facets.map((f) => (
          <button
            key={f.label}
            className="chip"
            aria-pressed={facet === f.label}
            onClick={() => setFacet(facet === f.label ? null : f.label)}
          >
            {f.label} <span className="chip__count">{f.count}</span>
          </button>
        ))}
      </div>

      <p className="browse__count" aria-live="polite">
        {results.length} {results.length === 1 ? 'poem' : 'poems'}
      </p>

      {results.length === 0 ? (
        <p className="browse__empty">No poem matches that. Try a shorter word, or clear the filter.</p>
      ) : (
        <ul className="rows" role="list">
          {visible.map((p) => {
            const first = excerpt(p, 1)[0] ?? '';
            const meta = [p.category, formatShortDate(p.date)].filter(Boolean).join(', ');
            return (
              <li key={p.id}>
                <a className="row" href={`#book/${encodeURIComponent(p.id)}`}>
                  <span className="row__title">
                    {p.title}
                    {savedSet.has(p.id) && (
                      <span className="row__saved" role="img" aria-label="Saved">
                        <BookmarkIcon filled />
                      </span>
                    )}
                  </span>
                  {first && <span className="row__first">{first}</span>}
                  {meta && <span className="row__meta">{meta}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {results.length > visible.length && (
        <button className="btn btn--outline browse__more" onClick={() => setShown((n) => n + PAGE_SIZE)}>
          Show more poems
        </button>
      )}
    </section>
  );
}
