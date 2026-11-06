/*
 * Offline shell for Open Loops.
 *
 * Registered only by the production build (see src/main.tsx), so `npm run dev`
 * is never served from a cache and hot reload keeps working.
 *
 * Strategy: the shell is precached at install and used as the navigation
 * fallback; hashed build assets are cache-first because their names change on
 * every build; everything else same-origin (manifest, icons) is served from
 * cache and refreshed in the background.
 *
 * A new build does not activate itself. It waits until the page asks for it,
 * so the user is never swapped onto a new build mid-edit (see src/offline-shell.ts).
 * `__BUILD_ID__` is replaced at build time, so every build looks different to
 * the browser and can be detected as an update.
 */
const VERSION = '__BUILD_ID__';
const SHELL_CACHE = `open-loops-shell-${VERSION}`;
const ASSET_CACHE = `open-loops-assets-${VERSION}`;

const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

const OFFLINE_BODY = 'Open Loops is offline and this copy has no cached shell yet.';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL)),
  );
});

// Sent by the page once the user chooses to reload into the new build.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
      const names = await caches.keys();
      await Promise.all(names.filter((name) => !keep.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

function offline() {
  return new Response(OFFLINE_BODY, {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

async function store(cacheName, request, response) {
  if (!response || !response.ok || response.type !== 'basic') return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await store(SHELL_CACHE, '/', response.clone());
    return response;
  } catch {
    const shell = await caches.open(SHELL_CACHE).then((cache) => cache.match('/'));
    return shell || offline();
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  await store(ASSET_CACHE, request, response.clone());
  return response;
}

async function staleWhileRevalidate(event, request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (response) => {
      await store(ASSET_CACHE, request, response.clone());
      return response;
    })
    .catch(() => null);
  event.waitUntil(network);
  if (cached) return cached;
  return (await network) || offline();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never serve the worker itself from a cache, or updates could never land.
  if (url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(event, request));
  }
});
