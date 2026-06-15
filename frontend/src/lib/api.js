import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5001";
const cleanBase = rawBase.replace(/\/+$/, "");
const API_BASE = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

export { API_BASE };
export default api;
