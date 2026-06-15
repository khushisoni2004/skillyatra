import { API_BASE } from "./config";

let warmed = false;

export function warmBackend() {
  if (warmed || typeof window === "undefined") return;
  warmed = true;

  const urls = [
    `${API_BASE}/health`,
    `${API_BASE}/companies?limit=1`,
    `${API_BASE}/dsa/questions?page=1&limit=1`
  ];

  const ping = () => {
    urls.forEach((url) => {
      fetch(url, {
        method: "GET",
        cache: "no-store",
        mode: "cors"
      }).catch(() => {});
    });
  };

  ping();
  setTimeout(ping, 1200);
  setTimeout(ping, 3500);
}
