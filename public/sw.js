// Service Worker for Quentro PWA - Ultra-Fast Zero-Bottleneck Architecture
const SHELL_CACHE = 'quentro-shell-v11';
const IMAGE_CACHE = 'quentro-images-v2';

// Minimal shell assets for instant, lightweight install (no heavy images blocking initial load)
const SHELL_ASSETS = [
  '/manifest.json?v=5',
  '/favicon.ico',
];

// 1. Lightweight Install: No heavy parallel downloads, immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
  );
});

// 2. Activate: Clean up obsolete app shells while preserving the persistent IMAGE_CACHE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== SHELL_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Never intercept internal development routes or Firebase APIs
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/__vite') ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@fs') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com')
  ) {
    return;
  }

  // A. STATIC IMAGES: Cache-First (Instant 0ms display once accessed, permanent cache)
  const isImage = /\.(webp|jpg|jpeg|png|gif|svg|ico)$/i.test(url.pathname);
  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache yet: fetch from network and store for next time
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(async () => {
            // Fallback for bts poster if offline
            if (url.pathname.includes('bts-poster')) {
              const fallback = (await cache.match('/bts-poster-square.webp')) || (await cache.match('/bts-poster-square.jpg'));
              if (fallback) return fallback;
            }
            return new Response('', { status: 404 });
          });
      })
    );
    return;
  }

  // B. STATIC SCRIPTS & STYLES (/assets/): Cache-First for instant page rendering
  const isStaticBundle =
    url.pathname.startsWith('/assets/') ||
    /\.(woff2|woff|ttf|css|js)$/i.test(url.pathname);

  if (isStaticBundle) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. HTML NAVIGATION: Fast Network-First with quick cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Default network fetch
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || new Response('Offline', { status: 503 });
    })
  );
});
