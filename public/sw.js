// Service Worker — Go Study!
// Strategy:
//   - App shell (JS/CSS/HTML/icons/splash): Cache-first, updated in background on new deploy
//   - Supabase API / auth calls: Network-first, no caching
//   - Cross-origin (fonts, CDN): Network-first with cache fallback
//   - Navigation requests (SPA): Cache-first → serve index.html offline

const CACHE_VERSION = 'v4';
const SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Replaced at build time by the Vite sw-asset-injector plugin.
const PRECACHE_ASSETS = self.__PRECACHE_ASSETS__ || ['/'];

// ── Skip waiting on demand (triggered by update toast) ───────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing logic ──────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept: non-GET, Supabase API, chrome-extension
  if (
    request.method !== 'GET' ||
    url.hostname.includes('supabase.co') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // Same-origin navigation (SPA page loads) — serve index.html from cache when offline
  if (url.origin === self.location.origin && request.mode === 'navigate') {
    event.respondWith(spaNavigate(request));
    return;
  }

  // Same-origin static assets (JS/CSS/icons/splash/fonts) — Cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Cross-origin (Google Fonts, CDN, etc.) — Network-first with cache fallback
  event.respondWith(networkFirst(request));
});

// ── Strategies ────────────────────────────────────────────────────────────────

/** SPA navigation: try network, fall back to cached index.html */
async function spaNavigate(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match('/') || await caches.match('/index.html');
    if (cached) return cached;
    return new Response('<h1>You are offline</h1><p>Please reconnect to use Go Study!</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

/** Cache-first: serve from cache, fetch + update in background if missing */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and not cached — fall back to root for SPA
    return (await caches.match('/')) || new Response('Offline', { status: 503 });
  }
}

/** Network-first: try network, fall back to cache */
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}
