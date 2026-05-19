import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error({ err, path: req.originalUrl }, "Request failed");

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};
