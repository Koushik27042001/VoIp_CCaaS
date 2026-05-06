import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import callRoutes from "./modules/calls/call.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Server is running" });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
