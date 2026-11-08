import type { Poem } from '../types/poem';
import { excerpt, formatShortDate, toneFor } from './poemUtils';

export function FeaturedCard({ poem }: { poem: Poem }) {
  const lines = excerpt(poem, 4);
  const meta = [poem.category, formatShortDate(poem.date)].filter(Boolean).join(', ');

  return (
    <article className="featured" data-tone={toneFor(poem.category ?? poem.id)}>
      <div>
        <h3 className="featured__title">{poem.title}</h3>
        {meta && <p className="featured__meta">{meta}</p>}
        <blockquote className="featured__text">
          {lines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </blockquote>
      </div>
      <a className="btn btn--solid" href={`#book/${encodeURIComponent(poem.id)}`}>
        Read this poem
      </a>
    </article>
  );
}
