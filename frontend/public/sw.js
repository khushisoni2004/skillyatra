const CACHE_NAME = "skillyatra-static-v20";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only GET requests may be cached.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never intercept:
  // 1. Render backend requests
  // 2. Any cross-origin request
  // 3. API requests
  if (
    url.origin !== self.location.origin ||
    url.hostname.includes("onrender.com") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);

        // Cache only valid same-origin basic responses.
        if (
          networkResponse &&
          networkResponse.ok &&
          networkResponse.type === "basic"
        ) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse.clone());
          } catch (cacheError) {
            // Cache failure must never break the page.
            console.warn("Static cache skipped:", cacheError);
          }
        }

        return networkResponse;
      } catch (networkError) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        throw networkError;
      }
    })()
  );
});
