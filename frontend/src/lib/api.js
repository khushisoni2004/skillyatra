import axios from "axios";
import { API_BASE } from "./config";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 90000,
});

export { API_BASE };
export default api;
