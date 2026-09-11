import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  console.log("AXIOS AUTH DEBUG:", {
    url: config.url,
    method: config.method,
    token_exists: !!token,
  });

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});