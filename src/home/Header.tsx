import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../book/icons';
import { MenuIcon, SearchIcon } from './icons';

export interface MenuLink {
  label: string;
  targetId: string;
}

interface Props {
  links: MenuLink[];
  onNavigate(targetId: string): void;
  onSearch(): void;
  /** Show an "Install the app" item in the menu. */
  showInstall?: boolean;
  onInstall?(): void;
}

export function Header({ links, onNavigate, onSearch, showInstall = false, onInstall }: Props) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header className="hbar">
        <button className="hbar__btn" onClick={() => setOpen(true)} aria-label="Open menu">
          <MenuIcon />
        </button>
        <a className="hbar__brand" href="#" aria-label="ABOUT US, home">
          ABOUT US
        </a>
        <button className="hbar__btn" onClick={onSearch} aria-label="Search poems">
          <SearchIcon />
        </button>
      </header>

      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="menu-title" onClick={(e) => e.stopPropagation()}>
            <div className="sheet__head">
              <h2 id="menu-title" className="sheet__title">
                Menu
              </h2>
              <button ref={closeRef} className="reader__btn" onClick={() => setOpen(false)} aria-label="Close menu">
                <CloseIcon />
              </button>
            </div>
            <ul className="sheet__list">
              {links.map((l) => (
                <li key={l.targetId}>
                  <button
                    className="sheet__item"
                    onClick={() => {
                      setOpen(false);
                      onNavigate(l.targetId);
                    }}
                  >
                    <span className="sheet__name">{l.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <a className="sheet__item" href="#book">
                  <span className="sheet__name">Open the book</span>
                </a>
              </li>
              {showInstall && (
                <li>
                  <button
                    className="sheet__item"
                    onClick={() => {
                      setOpen(false);
                      onInstall?.();
                    }}
                  >
                    <span className="sheet__name">Install the app</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
