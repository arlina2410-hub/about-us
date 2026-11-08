/* ABOUT US service worker. Generated into dist/sw.js at build time by vite-plugin-sw.ts.
   The version number and the list of files below are filled in automatically during the build.
   Never edit dist/sw.js by hand. */

const VERSION = '__VERSION__';
const CACHE = 'aboutus-' + VERSION;
const PRECACHE = __PRECACHE__;

// Install: download every file of this version into a fresh cache. Does NOT take over yet,
// so a reader in the middle of a poem is never switched under their feet.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // cache: 'reload' skips the browser's own HTTP cache so we always store the newest files.
      Promise.all(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' })))),
    ),
  );
});

// Activate: remove caches of older versions, then control open pages.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith('aboutus-') && n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

// The app asks for the update when the reader taps "Update".
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Every page of the app is the same single page (routes live in the #hash), so serve the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html', { cacheName: CACHE }).then((cached) => cached || fetch(request)),
    );
    return;
  }

  // Everything else: cached copy first, network as a backup.
  event.respondWith(caches.match(request, { cacheName: CACHE }).then((cached) => cached || fetch(request)));
});
