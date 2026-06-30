const CACHE_NAME = "c-transit-cache-v1";
// service-worker.js
const API_BASE_URL = "https://c-transit-pink.vercel.app"; 

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
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => clients.claim()) // take control immediately
  );
});

// ── Fetch: strategy depends on request type ───────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. API calls — network only, never serve from cache
  if (url.pathname.startsWith( API_BASE_URL)) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: "You are offline. Please reconnect." }),
          { headers: { "Content-Type": "application/json" }, status: 503 }
        )
      )
    );
    return;
  }

  // 2. Navigation requests — network first, fallback to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // 3. Static assets (JS, CSS, images) — cache first, then network
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Dynamically cache valid asset responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});