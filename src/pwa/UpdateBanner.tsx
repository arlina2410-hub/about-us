import { useState } from 'react';
import { applyUpdate } from './registerSW';
import { useUpdateReady } from './hooks';
import './pwa.css';

/** Shown when a new version (new poems or fixes) has been downloaded and is waiting. */
export function UpdateBanner() {
  const ready = useUpdateReady();
  const [dismissed, setDismissed] = useState(false);
  if (!ready || dismissed) return null;

  return (
    <div className="pwa-banner" role="status">
      <p className="pwa-banner__text">New poems are waiting for you.</p>
      <button className="pwa-banner__btn pwa-banner__btn--solid" onClick={applyUpdate}>
        Update
      </button>
      <button className="pwa-banner__btn" onClick={() => setDismissed(true)}>
        Later
      </button>
    </div>
  );
}
