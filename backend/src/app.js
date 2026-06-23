import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import callRoutes from "./modules/calls/call.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import leadAssignmentRoutes from "./modules/leadAssignments/leadAssignment.routes.js";
import leadRoutes from "./modules/leads/lead.routes.js";
import sipRoutes from "./modules/sip/sip.routes.js";
import sipTrunkRoutes from "./modules/sipTrunks/sipTrunk.routes.js";
import telecomRoutes from "./modules/telecom/telecom.routes.js";
import twilioRoutes from "./modules/twilio/twilio.routes.js";
import webhookRoutes from "./modules/webhooks/webhook.routes.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { metrics } from "./telemetry/metrics.js";
import { getTelecomStatus as getOutboundTelecomStatus } from "./services/outboundCall.service.js";

const app = express();

app.use(cors());

// Twilio webhooks must be mounted before global body parsers for signature validation.
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/lead-assignments", leadAssignmentRoutes);
app.use("/api/sip", sipRoutes);
app.use("/api/sip-trunks", sipTrunkRoutes);
app.use("/api/telecom", telecomRoutes);
app.use("/api/twilio", twilioRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    telecom: getOutboundTelecomStatus(),
    ...(process.env.NODE_ENV !== "production" && {
      metrics: metrics.snapshot(),
    }),
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
