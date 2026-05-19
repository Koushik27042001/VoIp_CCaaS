import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  getTodayAnalytics,
  getAgentAnalytics,
} from "./analytics.controller.js";

const router = express.Router();

router.get("/", protect, getTodayAnalytics);
router.get("/agent/:agentId", protect, getAgentAnalytics);

export default router;
