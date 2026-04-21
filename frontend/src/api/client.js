import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to add token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  } else {
    console.log(`📡 API Request (no auth): ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Intercept responses for error handling
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error(`❌ API Error ${error.response.status}: ${error.response.config.url}`, error.response.data);

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn("🔐 Token expired or invalid, clearing local storage");
        localStorage.removeItem("token");
        // Optionally redirect to login
        // window.location.href = "/login";
      }
    } else if (error.request) {
      // Network error
      console.error("🌐 Network error - Backend may be down:", error.message);
    } else {
      // Other error
      console.error("❌ API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
