import "./config/env.js";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import authRoutes from "./modules/auth/auth.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import callRoutes from "./modules/calls/call.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import sipTrunkRoutes from "./modules/sipTrunks/sipTrunk.routes.js";
import telecomRoutes from "./modules/telecom/telecom.routes.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import logger from "./utils/logger.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(
  pinoHttp({
    logger,
    autoLogging: process.env.NODE_ENV !== "test",
  })
);
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sip-trunks", sipTrunkRoutes);
app.use("/api/telecom", telecomRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
