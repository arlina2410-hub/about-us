import { useEffect, useRef } from 'react';
import type { Poem } from '../types/poem';
import { CloseIcon } from './icons';

interface Props {
  poems: Poem[];
  /** poem id -> page number shown in the book */
  startPages: Record<string, number>;
  onPick(poemId: string): void;
  onClose(): void;
}

export function ContentsSheet({ poems, startPages, onPick, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const items = poems.filter((p) => startPages[p.id] !== undefined);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contents-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__head">
          <h2 id="contents-title" className="sheet__title">
            Contents
          </h2>
          <button ref={closeRef} className="reader__btn" onClick={onClose} aria-label="Close contents">
            <CloseIcon />
          </button>
        </div>
        <ul className="sheet__list">
          {items.map((p) => (
            <li key={p.id}>
              <button className="sheet__item" onClick={() => onPick(p.id)}>
                <span className="sheet__name">{p.title}</span>
                <span className="sheet__num">{startPages[p.id]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
