// WSL CT History — Service Worker
// Strategy: network-first for HTML (always fresh data when online),
//           cache-first for static assets (icons, manifest).

const CACHE = 'wsl-ct-v1';
const PRECACHE = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

// ── Install: pre-cache all app files ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for HTML, cache-first for assets ─────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  const isHtml = url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('/') ||
                 url.pathname === self.location.pathname.replace(/[^/]*$/, '');

  if (isHtml) {
    // Network-first: always try to get the latest data from the server.
    // Falls back to cache if offline.
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first: serve icons/manifest from cache, fetch if missing.
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
  }
});
