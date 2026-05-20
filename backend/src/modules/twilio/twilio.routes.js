import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { getTwilioStatus, getVoiceToken } from "./twilio.controller.js";

const router = express.Router();

router.get("/status", protect, getTwilioStatus);
router.get("/token", protect, getVoiceToken);

export default router;
