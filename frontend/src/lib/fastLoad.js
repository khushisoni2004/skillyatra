import { API_BASE } from "./config";

const FAST_ENDPOINTS = [
  `${API_BASE}/health`,
  `${API_BASE}/dsa/questions?page=1&limit=20&topic=All&platform=All&difficulty=All&search=`,
  `${API_BASE}/companies?limit=2000`,
  `${API_BASE}/resources`,
  `${API_BASE}/resume/companies`,
  `${API_BASE}/interview/companies`,
  `${API_BASE}/practice/questions?limit=50`
];

export function enableFastLoad() {
  registerServiceWorker();
  warmAndPrefetch();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {});
  });
}

function warmAndPrefetch() {
  setTimeout(() => {
    FAST_ENDPOINTS.forEach((url) => {
      fetch(url, {
        method: "GET",
        cache: "force-cache",
        mode: "cors"
      }).catch(() => {});
    });
  }, 300);
}
