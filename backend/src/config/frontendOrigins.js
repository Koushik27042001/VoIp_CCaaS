const DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const normalizeOrigin = (origin = "") => String(origin).trim().replace(/\/$/, "");

export const getAllowedFrontendOrigins = () => {
  const envOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  return Array.from(
    new Set([...DEFAULT_LOCAL_ORIGINS.map((origin) => normalizeOrigin(origin)), ...envOrigins])
  );
};

export const isAllowedOrigin = (origin = "") => {
  if (!origin) {
    return true;
  }
  const normalized = normalizeOrigin(origin);
  return getAllowedFrontendOrigins().includes(normalized);
};

export default { getAllowedFrontendOrigins, isAllowedOrigin };
