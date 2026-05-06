import express from "express";
import {
  getTodayAnalytics,
  getAgentAnalytics,
} from "./analytics.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getTodayAnalytics);
router.get("/today", protect, getTodayAnalytics);
router.get("/agent/:agentId", protect, getAgentAnalytics);

export default router;
