import express from "express";
import {
  outboundVoiceTwiml,
  clientVoiceTwiml,
  inboundVoiceTwiml,
  inboundSmsWebhook,
  callStatusWebhook,
  getTwilioConsoleConfig,
  twilioWebhookMiddleware,
} from "./twilio.webhook.js";

const router = express.Router();

router.get("/twilio/setup", getTwilioConsoleConfig);

router.post("/twilio/voice/outbound", twilioWebhookMiddleware, outboundVoiceTwiml);
router.post("/twilio/voice/client", twilioWebhookMiddleware, clientVoiceTwiml);
router.post("/twilio/voice/inbound", twilioWebhookMiddleware, inboundVoiceTwiml);
router.post("/twilio/sms/inbound", twilioWebhookMiddleware, inboundSmsWebhook);
router.post("/twilio/status", twilioWebhookMiddleware, callStatusWebhook);

export default router;
