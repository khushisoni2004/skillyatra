const CACHE_NAME = "skillyatra-fast-api-cache-v3";
const BACKEND_ORIGIN = "https://skillyatra-backend.onrender.com";

function isBackendGet(request) {
  try {
    const url = new URL(request.url);
    return (
      request.method === "GET" &&
      url.origin === BACKEND_ORIGIN &&
      url.pathname.startsWith("/api/") &&
      !url.pathname.includes("/auth/login") &&
      !url.pathname.includes("/auth/register")
    );
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (!isBackendGet(request)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const networkPromise = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        event.waitUntil(networkPromise);
        return cached;
      }

      const fresh = await networkPromise;
      if (fresh) return fresh;

      return new Response(
        JSON.stringify({
          ok: false,
          message: "Network unavailable and no cache found"
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }
      );
    })
  );
});
