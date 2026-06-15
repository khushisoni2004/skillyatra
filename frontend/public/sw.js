const CACHE_NAME = "skillyatra-api-cache-v1";
const BACKEND_ORIGIN = "https://skillyatra-backend.onrender.com";

const SAFE_API_PREFIXES = [
  "/api/health",
  "/api/dsa/questions",
  "/api/companies",
  "/api/resources",
  "/api/resume/companies",
  "/api/interview/companies",
  "/api/practice/questions"
];

function isSafeApiRequest(request) {
  try {
    const url = new URL(request.url);

    if (request.method !== "GET") return false;
    if (url.origin !== BACKEND_ORIGIN) return false;
    if (request.headers.has("Authorization")) return false;

    return SAFE_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
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

  if (!isSafeApiRequest(request)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      if (cached) {
        event.waitUntil(networkFetch);
        return cached;
      }

      return networkFetch;
    })
  );
});
