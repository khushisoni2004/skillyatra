import { API_BASE, BACKEND_BASE } from "./config";

const CACHE_NAME = "skillyatra-fast-api-cache-v3";

const PREFETCH_URLS = [
  `${API_BASE}/health`,
  `${API_BASE}/dsa/questions?page=1&limit=20&topic=All&platform=All&difficulty=All&search=`,
  `${API_BASE}/companies?limit=2000`,
  `${API_BASE}/resources`,
  `${API_BASE}/resume/companies`,
  `${API_BASE}/interview/companies`,
  `${API_BASE}/practice/questions?limit=50`,
  `${API_BASE}/progress/summary`
];

let installed = false;

function getRequestUrl(input) {
  if (typeof input === "string") return input;
  if (input?.url) return input.url;
  return "";
}

function getRequestMethod(input, init) {
  return (init?.method || input?.method || "GET").toUpperCase();
}

function isCacheableBackendGet(input, init = {}) {
  try {
    const url = new URL(getRequestUrl(input), window.location.origin);
    const method = getRequestMethod(input, init);

    if (method !== "GET") return false;
    if (url.origin !== BACKEND_BASE) return false;
    if (!url.pathname.startsWith("/api/")) return false;
    if (url.pathname.includes("/auth/login")) return false;
    if (url.pathname.includes("/auth/register")) return false;

    return true;
  } catch {
    return false;
  }
}

export function installSmartFetchCache() {
  if (installed || typeof window === "undefined") return;
  if (!window.fetch) return;

  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function smartFetch(input, init = {}) {
    if (!isCacheableBackendGet(input, init)) {
      return originalFetch(input, init);
    }

    if (!("caches" in window)) {
      return originalFetch(input, init);
    }

    const request = new Request(input, init);
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const freshPromise = originalFetch(input, {
      ...init,
      cache: "no-store"
    })
      .then((response) => {
        if (response && response.ok) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => null);

    if (cached) {
      freshPromise.catch(() => {});
      return cached;
    }

    const fresh = await freshPromise;
    if (fresh) return fresh;

    return originalFetch(input, init);
  };

  registerServiceWorker();
  warmBackendAndPrefetch(originalFetch);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

function warmBackendAndPrefetch(originalFetch) {
  const run = () => {
    PREFETCH_URLS.forEach((url) => {
      originalFetch(url, {
        method: "GET",
        cache: "no-store",
        mode: "cors"
      })
        .then(async (response) => {
          if (!response.ok || !("caches" in window)) return;

          const cache = await caches.open(CACHE_NAME);
          await cache.put(new Request(url), response.clone());
        })
        .catch(() => {});
    });
  };

  run();
  setTimeout(run, 1500);
  setTimeout(run, 5000);
}
