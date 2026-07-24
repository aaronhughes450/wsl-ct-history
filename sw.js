// WSL CT History — Service Worker
// Network-only: no caching. The app runs on localhost with no-cache headers,
// so SW caching only causes stale-version problems. Clear all old caches on activate.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Pass every request straight to the network, bypassing the HTTP cache too
// (cache:'no-store'). This keeps the app fresh even when the host sends its own
// cache headers — e.g. the published GitHub Pages copy, where index.html would
// otherwise be served stale for a few minutes. Locally it's a no-op (the server
// already sends no-store). Falls back to a plain fetch if no-store is rejected.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request, { cache: 'no-store' }).catch(() => fetch(event.request))
  );
});
