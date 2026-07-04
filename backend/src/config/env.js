import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const isMockMode = () => process.env.USE_MOCK === "true";
export const getMongoUri = () => process.env.MONGO_URI || process.env.MONGODB_URI || "";

export const validateProductionEnv = () => {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = [];
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (!getMongoUri()) missing.push("MONGO_URI or MONGODB_URI");
  if (!process.env.PUBLIC_API_URL) missing.push("PUBLIC_API_URL");
  if (!process.env.FRONTEND_URL && !process.env.CORS_ORIGIN) {
    missing.push("FRONTEND_URL or CORS_ORIGIN");
  }

  if (missing.length) {
    throw new Error(`Missing required production env: ${missing.join(", ")}`);
  }
};
