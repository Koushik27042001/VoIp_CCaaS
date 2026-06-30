const trimTrailingSlash = (value = "") => String(value).trim().replace(/\/$/, "");

const browserOrigin = () => {
  if (typeof window === "undefined") {
    return "";
  }
  return trimTrailingSlash(window.location.origin);
};

export const resolveApiBaseUrl = () => {
  const envApi = trimTrailingSlash(process.env.REACT_APP_API_URL || "");
  if (envApi) {
    return envApi;
  }

  const origin = browserOrigin();
  if (origin) {
    return `${origin}/api`;
  }

  return "http://localhost:5000/api";
};

export const resolveSocketBaseUrl = () => {
  const envSocket = trimTrailingSlash(process.env.REACT_APP_SOCKET_URL || "");
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

  return "http://localhost:5000";
};

export default { resolveApiBaseUrl, resolveSocketBaseUrl };
