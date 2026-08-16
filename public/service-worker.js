// 1. BUMP THE CACHE VERSION TO FORCE AN UPDATE
const CACHE_NAME = "c-transit-cache-v5";

// 2. REAL STATIC ASSETS (use existing SVG icons)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg",
];

// ── Install: safely cache static assets without breaking if one fails ─────────
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache each asset individually so a missing item never breaks installation
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[SW] Warning: Failed to pre-cache ${asset}:`, err);
        }
      }
    })
  );
});

// ── Activate: clear old caches + claim clients ───────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim()) // take control immediately
  );
});

// ── Fetch: strategy depends on request type ───────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 0. Skip non-GET requests entirely — SW must never intercept POST/PUT/DELETE
  if (request.method !== "GET") return;

  // 1. Skip Vite internal dev URLs, source files, and WebSocket upgrades
  if (
    url.pathname.includes("/node_modules/") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/@vite/") ||
    url.pathname.startsWith("/@fs/") ||
    url.pathname.startsWith("/@id/") ||
    request.headers.get("upgrade") === "websocket"
  ) {
    return;
  }

  // 2. API calls — network only, never serve from cache
  if (url.pathname.startsWith("/api")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            JSON.stringify({ error: "You are offline. Please reconnect." }),
            { headers: { "Content-Type": "application/json" }, status: 503 }
          )
      )
    );
    return;
  }

  // 3. Navigation requests — network first, fallback to cached index or offline page or synthetic HTML
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match("/offline.html");
        if (cachedOffline) return cachedOffline;

        const cachedIndex = await cache.match("/index.html") || await cache.match("/");
        if (cachedIndex) return cachedIndex;

        return new Response(
          "<!doctype html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>C-Transit Offline</title></head><body style='font-family:sans-serif;text-align:center;padding:40px;'><h2>You are offline</h2><p>Please check your connection and reload.</p><button onclick='location.reload()'>Retry</button></body></html>",
          { headers: { "Content-Type": "text/html" }, status: 200 }
        );
      })
    );
    return;
  }

  // 4. Static assets — cache first, then network
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            if (response.ok && response.type === "basic") {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // Return empty response for missing static sub-resources rather than failing
            return new Response("", { status: 404 });
          })
    )
  );
});
