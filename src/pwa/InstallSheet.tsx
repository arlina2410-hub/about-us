import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../book/icons';
import { useInstallKind } from './hooks';
import { promptInstall } from './install';
import './pwa.css';

/** Explains how to install ABOUT US on this device, with a one-tap button where the browser allows it. */
export function InstallSheet({ onClose }: { onClose(): void }) {
  const kind = useInstallKind();
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

  const install = async () => {
    const result = await promptInstall();
    if (result === 'accepted') onClose();
    else if (result === 'unavailable') setNote('Use your browser menu and choose "Install app" or "Add to Home screen".');
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <h2 id="install-title" className="sheet__title">
            Install ABOUT US
          </h2>
          <button ref={closeRef} className="reader__btn reader__btn--icon" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="install">
          <p>Keep the book on your home screen. It opens like a normal app and works without internet.</p>

          {kind === 'installed' && <p className="install__done">ABOUT US is already installed on this device.</p>}

          {kind === 'prompt' && (
            <button className="pwa-banner__btn pwa-banner__btn--solid install__btn" onClick={install}>
              Install the app
            </button>
          )}

          {kind === 'ios' && (
            <ol className="install__steps">
              <li>
                Tap the <strong>Share</strong> button in Safari (the square with an arrow pointing up).
              </li>
              <li>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </li>
              <li>
                Tap <strong>Add</strong>. The ABOUT US icon appears on your home screen.
              </li>
            </ol>
          )}

          {kind === 'manual' && (
            <ol className="install__steps">
              <li>
                On a computer with Chrome or Edge, click the <strong>install icon</strong> at the right end of the address bar.
              </li>
              <li>
                On an Android phone, open the browser menu (three dots) and tap <strong>Install app</strong> or{' '}
                <strong>Add to Home screen</strong>.
              </li>
            </ol>
          )}

          <p className="install__note" role="status">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}
