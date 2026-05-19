import express from "express";
import {
  outboundVoiceTwiml,
  callStatusWebhook,
} from "./twilio.webhook.js";

const router = express.Router();

router.post("/twilio/voice/outbound", outboundVoiceTwiml);
router.post("/twilio/status", callStatusWebhook);

export default router;
