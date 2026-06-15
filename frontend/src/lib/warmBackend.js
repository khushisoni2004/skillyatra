export function warmBackend() {
  const backendUrl = "https://skillyatra-backend.onrender.com/api/health";

  try {
    fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
      mode: "cors"
    }).catch(() => {});
  } catch {}
}
