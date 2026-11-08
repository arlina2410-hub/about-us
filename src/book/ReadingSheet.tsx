import { useEffect, useRef, useState } from 'react';
import type { Poem } from '../types/poem';
import { copyPoem, sharePoem } from '../lib/share';
import { SCALES, stepScale, type Settings, type ThemeName } from '../lib/validators';
import { CloseIcon } from './icons';

const THEMES: { id: ThemeName; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'dark', label: 'Dark' },
];

interface Props {
  settings: Settings;
  onChange(patch: Partial<Settings>): void;
  /** The poem on the current page, if any. */
  poem: Poem | null;
  onClose(): void;
}

export function ReadingSheet({ settings, onChange, poem, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const share = async () => {
    if (!poem) return;
    const result = await sharePoem(poem);
    setNote(
      result === 'copied'
        ? 'Poem and link copied.'
        : result === 'failed'
          ? 'Sharing is not available here.'
          : '',
    );
  };

  const copy = async () => {
    if (!poem) return;
    setNote((await copyPoem(poem)) ? 'Poem and link copied.' : 'Could not copy on this device.');
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="opts-title" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <h2 id="opts-title" className="sheet__title">
            Reading options
          </h2>
          <button ref={closeRef} className="reader__btn reader__btn--icon" onClick={onClose} aria-label="Close reading options">
            <CloseIcon />
          </button>
        </div>

        <div className="opts">
          <p className="opts__label" id="theme-label">
            Page colour
          </p>
          <div className="opts__themes" role="radiogroup" aria-labelledby="theme-label">
            {THEMES.map((t) => (
              <button
                key={t.id}
                role="radio"
                aria-checked={settings.theme === t.id}
                className="theme"
                data-swatch={t.id}
                onClick={() => onChange({ theme: t.id })}
              >
                <span className="theme__chip" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>

          <p className="opts__label" id="size-label">
            Text size
          </p>
          <div className="opts__size" role="group" aria-labelledby="size-label">
            <button
              className="reader__btn"
              onClick={() => onChange({ textScale: stepScale(settings.textScale, -1) })}
              disabled={settings.textScale <= SCALES[0]}
              aria-label="Smaller text"
            >
              A&minus;
            </button>
            <output aria-live="polite">{Math.round(settings.textScale * 100)}%</output>
            <button
              className="reader__btn"
              onClick={() => onChange({ textScale: stepScale(settings.textScale, 1) })}
              disabled={settings.textScale >= SCALES[SCALES.length - 1]}
              aria-label="Larger text"
            >
              A+
            </button>
          </div>

          <div className="opts__actions">
            <button className="reader__btn" onClick={share} disabled={!poem}>
              Share this poem
            </button>
            <button className="reader__btn" onClick={copy} disabled={!poem}>
              Copy poem
            </button>
          </div>
          <p className="opts__note" role="status">
            {poem ? note : 'Turn to a poem to share it.'}
          </p>
        </div>
      </div>
    </div>
  );
}
