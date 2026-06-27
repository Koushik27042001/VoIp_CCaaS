import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = error.config?.url || "";
      const isExpectedAuthFailure =
        path.includes("/auth/login") || path.includes("/auth/setup");

      // Keep users on the current page for non-auth API failures.
      // Session cleanup should happen only when /auth/me confirms token is invalid.
      if (path.includes("/auth/me")) {
        localStorage.removeItem("token");
      } else if (isExpectedAuthFailure) {
        // Ignore 401 on login/setup; UI already handles these messages.
      }
    }
    return Promise.reject(error);
  }
);

export default API;
