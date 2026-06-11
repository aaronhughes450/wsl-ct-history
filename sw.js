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

// Pass every request straight to the network — no caching at all
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
