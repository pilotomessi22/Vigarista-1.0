// Service Worker for Quentro PWA - High Performance Image & Static Asset Cache Shield
const SHELL_CACHE = 'quentro-shell-v10';
const IMAGE_CACHE = 'quentro-images-v2';

const CRITICAL_IMAGES = [
  '/bts-poster-square.webp',
  '/bts-poster-square.jpg',
  '/bts-poster-full.webp',
  '/bts-poster-full.jpg',
  '/vigarista-poster.webp',
  '/safari-icon.svg',
  '/ticketmaster-white.svg',
  '/ticketmaster-wordmark.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

const SHELL_ASSETS = [
  '/',
  '/manifest.json?v=5',
];

// Pre-cache core assets on install
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS).catch((e) => console.log('[SW] Shell cache notice:', e))),
      caches.open(IMAGE_CACHE).then((cache) => cache.addAll(CRITICAL_IMAGES).catch((e) => console.log('[SW] Image cache notice:', e))),
    ])
  );
});

// Activate and clean up old versions, preserving the persistent IMAGE_CACHE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== SHELL_CACHE && name !== IMAGE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting stale cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Never intercept API routes, Firebase Firestore or dev tools
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

  // 1. IMAGE ASSETS: Dedicated Cache-First Strategy
  // Returns instantly (0ms) from cache to completely eliminate screen switching flash or loading delay
  const isImage = /\.(webp|jpg|jpeg|png|gif|svg|ico)$/i.test(url.pathname);
  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // Serve instantly from cache.
          // Stale-While-Revalidate in background for non-critical assets
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse);
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // If not in cache, fetch from network and store in IMAGE_CACHE
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(async () => {
            // Offline fallback for BTS square
            if (url.pathname.includes('bts-poster')) {
              const fallback = await cache.match('/bts-poster-square.webp') || await cache.match('/bts-poster-square.jpg');
              if (fallback) return fallback;
            }
            return new Response('', { status: 404 });
          });
      })
    );
    return;
  }

  // 2. HTML NAVIGATION: Network-First (with immediate cache fallback)
  // Ensures fresh deployments are loaded without white screen issues
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

  // 3. OTHER STATIC ASSETS (JS bundles, CSS, Fonts): Cache-First
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

  // Default network fetch
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      return cached || new Response('Offline', { status: 503 });
    })
  );
});
