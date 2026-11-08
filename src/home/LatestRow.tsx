import type { Poem } from '../types/poem';
import { Sprig } from '../book/BookPages';
import { formatShortDate, toneFor } from './poemUtils';

/** Horizontal row of small "book cover" cards for the newest poems. */
export function LatestRow({ poems }: { poems: Poem[] }) {
  return (
    <ul className="latest" role="list">
      {poems.map((p) => (
        <li key={p.id}>
          <a className="pcard" data-tone={toneFor(p.category ?? p.id)} href={`#book/${encodeURIComponent(p.id)}`}>
            <Sprig className="pcard__sprig" />
            <span className="pcard__title">{p.title}</span>
            <span className="pcard__meta">{formatShortDate(p.date)}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
