import express from "express";
import {
  getTelecomReadiness,
  getSipRuntimePlan,
  getTelecomStatus,
  getTrunksHealth,
  regenerateRuntimeConfig,
} from "./telecom.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/status", getTelecomStatus);
router.get("/readiness", getTelecomReadiness);
router.get("/sip-runtime-plan", protect, getSipRuntimePlan);
router.get("/trunk-health", protect, getTrunksHealth);
router.post("/generate-runtime-config", protect, regenerateRuntimeConfig);

export default router;
