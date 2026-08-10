// 1. BUMP THE CACHE VERSION TO FORCE AN UPDATE
const CACHE_NAME = "c-transit-cache-v4";

// 2. UPDATE TO YOUR PREFERRED API BEHAVIOR
// If your API is on the same domain as the frontend, you don't need the full URL here.
// We will just check if the path starts with '/api'.

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ── Install: cache only real static assets ───────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
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
      .then(() => clients.claim()) // take control immediately
  );
});

// ── Fetch: strategy depends on request type ───────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 0. Skip non-GET requests entirely — SW must never intercept POST/PUT/DELETE
  if (request.method !== "GET") return;

  // 1. Skip Vite internal dev URLs — these have hashed filenames that change
  //    on every rebuild. Caching them causes 504 "Outdated Optimize Dep" errors
  //    because SW serves the old hash while Vite expects the new one.
  //    Also skip WebSocket upgrades so Vite HMR works without hard refresh.
  if (
    url.pathname.includes("/node_modules/.vite/") ||
    url.pathname.startsWith("/@vite/") ||
    url.pathname.startsWith("/@fs/") ||
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

  // 3. Navigation requests — network first, fallback to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // 4. Static assets — cache first, then network
  //    Only cache responses from the same origin with a successful status
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});
