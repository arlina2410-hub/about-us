import type { PoemPage } from './types';
import './poem-page.css';

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * The text of one poem page. The measuring code in paginate.ts renders THIS
 * component, so what is measured is exactly what readers see.
 * The page shell (paper, margins, page number) lives outside this component.
 */
export function PoemPageContent({ page }: { page: PoemPage }) {
  const meta = [page.category, formatDate(page.date)].filter(Boolean).join(', ');

  return (
    <div className={`pp${page.centered ? ' pp--centered' : ''}`}>
      {page.isFirst ? (
        <header className="pp__head">
          <h2 className="pp__title">{page.title}</h2>
          {meta && <p className="pp__meta">{meta}</p>}
          <span className="pp__rule" aria-hidden="true" />
        </header>
      ) : (
        <p className="pp__running">{page.title}</p>
      )}

      <div className="pp__body">
        {page.stanzas.map((lines, i) => (
          <p className="pp__stanza" key={i}>
            {lines.map((line, j) => (
              <span className="pp__line" key={j}>
                {line || '\u00A0'}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}
