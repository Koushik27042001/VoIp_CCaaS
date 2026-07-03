const trimTrailingSlash = (value = "") => String(value).trim().replace(/\/$/, "");

const browserOrigin = () => {
  if (typeof window === "undefined") {
    return "";
  }
  return trimTrailingSlash(window.location.origin);
};

export const resolveApiBaseUrl = () => {
  let envApi = trimTrailingSlash(process.env.REACT_APP_API_URL || "");
  
  // Bulletproof replacement: redirect any stale localhost:5000 requests to 5002
  if (envApi.includes("localhost:5000")) {
    envApi = envApi.replace("localhost:5000", "localhost:5002");
  }

  console.log("[Antigravity Debug] REACT_APP_API_URL env variable:", process.env.REACT_APP_API_URL);
  console.log("[Antigravity Debug] Resolved envApi:", envApi);
  if (envApi) {
    return envApi;
  }

  const origin = browserOrigin();
  console.log("[Antigravity Debug] Browser origin:", origin);
  if (origin) {
    return `${origin}/api`;
  }

  return "http://localhost:5002/api";
};

export const resolveSocketBaseUrl = () => {
  let envSocket = trimTrailingSlash(process.env.REACT_APP_SOCKET_URL || "");
  
  if (envSocket.includes("localhost:5000")) {
    envSocket = envSocket.replace("localhost:5000", "localhost:5002");
  }

  console.log("[Antigravity Debug] REACT_APP_SOCKET_URL env variable:", process.env.REACT_APP_SOCKET_URL);
  if (envSocket) {
    return envSocket;
  }

  const apiBase = resolveApiBaseUrl();
  if (apiBase.endsWith("/api")) {
    return apiBase.slice(0, -4);
  }

  const origin = browserOrigin();
  if (origin) {
    return origin;
  }

  return "http://localhost:5002";
};

export default { resolveApiBaseUrl, resolveSocketBaseUrl };
