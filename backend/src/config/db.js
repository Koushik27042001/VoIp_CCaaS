import mongoose from "mongoose";
import logger from "../telemetry/logger.js";

const getUriDiagnostics = (uri) => {
  try {
    const parsed = new URL(uri);
    return {
      protocol: parsed.protocol,
      host: parsed.host,
      db: parsed.pathname?.replace(/^\//, "") || "(none)",
      authSource: parsed.searchParams.get("authSource") || "(default)",
      hasCredentials: Boolean(parsed.username || parsed.password),
    };
  } catch {
    return {
      protocol: "unknown",
      host: "unknown",
      db: "unknown",
      authSource: "unknown",
      hasCredentials: false,
    };
  }
};

const normalizeMongoUri = (rawUri) => {
  const uri = rawUri?.trim();
  if (!uri) {
    return { uri, autoFixed: false };
  }

  try {
    const parsed = new URL(uri);
    const isAtlasSrv = parsed.protocol === "mongodb+srv:";
    const hasCredentials = Boolean(parsed.username || parsed.password);
    const hasAuthSource = parsed.searchParams.has("authSource");

    // Atlas users are typically created in admin; missing authSource can cause "bad auth".
    if (isAtlasSrv && hasCredentials && !hasAuthSource) {
      parsed.searchParams.set("authSource", "admin");
      return { uri: parsed.toString(), autoFixed: true };
    }
  } catch {
    return { uri, autoFixed: false };
  }

  return { uri, autoFixed: false };
};

export const connectDB = async ({ required = true } = {}) => {
  const { uri, autoFixed } = normalizeMongoUri(process.env.MONGO_URI);

  if (!uri) {
    if (required) {
      throw new Error("MONGO_URI is required");
    }

    logger.warn("MONGO_URI is missing; continuing without MongoDB in mock mode");
    return { connected: false, reason: "missing_uri" };
  }

  const diagnostics = getUriDiagnostics(uri);

  try {
    if (autoFixed) {
      logger.warn(
        "MONGO_URI had no authSource; using authSource=admin for Atlas authentication"
      );
    }

    await mongoose.connect(uri);
    logger.info({ mongo: diagnostics }, "MongoDB connected");
    return { connected: true, reason: "connected" };
  } catch (error) {
    if (required) {
      throw error;
    }

    logger.error(
      { err: error, mongo: diagnostics },
      "MongoDB connection failed; continuing in mock mode"
    );
    return { connected: false, reason: "connection_failed" };
  }
};
