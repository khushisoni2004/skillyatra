const RAW_BACKEND_BASE =
  import.meta.env.VITE_API_URL ||
  "https://skillyatra-backend.onrender.com";

export const BACKEND_BASE = RAW_BACKEND_BASE
  .replace(/\/api\/?$/, "")
  .replace(/\/+$/, "");

export const API_BASE = `${BACKEND_BASE}/api`;
