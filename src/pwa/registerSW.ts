/**
 * Registers the service worker and tells the app when a NEW version is waiting.
 * Only runs in the production build (npm run build), never in `npm run dev`.
 */
let waiting: ServiceWorker | null = null;
let updateRequested = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((cb) => cb());

export function subscribeUpdate(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function isUpdateReady(): boolean {
  return waiting !== null;
}

/** Called when the reader taps "Update": the new version takes over and the page reloads once. */
export function applyUpdate(): void {
  updateRequested = true;
  if (waiting) waiting.postMessage({ type: 'SKIP_WAITING' });
  else window.location.reload();
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  // Reload only when the reader asked for the update, never on the very first install.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested) window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((registration) => {
        const announceIfWaiting = () => {
          // A waiting worker while another one is in control means this is an update, not a first install.
          if (registration.waiting && navigator.serviceWorker.controller) {
            waiting = registration.waiting;
            notify();
          }
        };

        announceIfWaiting();
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          installing?.addEventListener('statechange', () => {
            if (installing.state === 'installed') announceIfWaiting();
          });
        });

        // Look for new poems whenever the app comes back to the screen, and once an hour while it stays open.
        const check = () => void registration.update().catch(() => undefined);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') check();
        });
        window.setInterval(check, 60 * 60 * 1000);
      })
      .catch((err: unknown) => console.warn('Service worker registration failed', err));
  });
}
