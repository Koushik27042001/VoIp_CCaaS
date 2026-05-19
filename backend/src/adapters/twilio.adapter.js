import twilio from "twilio";
import { twilioConfig, isTwilioEnabled } from "../config/twilio.js";
import logger from "../telemetry/logger.js";

let client = null;

const getClient = () => {
  if (!isTwilioEnabled()) {
    return null;
  }
  if (!client) {
    client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
  }
  return client;
};

const normalizeE164 = (phone) => {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) return phone;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
};

/**
 * Place PSTN outbound call to a mobile/landline via Twilio.
 */
export const dialPstn = async ({ to, callId }) => {
  const twilioClient = getClient();
  if (!twilioClient) {
    throw new Error("Twilio is not configured");
  }

  const statusCallback = `${twilioConfig.webhookBaseUrl}/api/webhooks/twilio/status?callId=${encodeURIComponent(callId)}`;

  const call = await twilioClient.calls.create({
    to: normalizeE164(to),
    from: twilioConfig.phoneNumber,
    url: `${twilioConfig.webhookBaseUrl}/api/webhooks/twilio/voice/outbound?callId=${encodeURIComponent(callId)}`,
    statusCallback,
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
  });

  logger.info({ callSid: call.sid, callId, to }, "Twilio PSTN call initiated");

  return {
    provider: "twilio",
    externalId: call.sid,
    status: call.status,
  };
};

export const isAvailable = () => isTwilioEnabled();

export default { dialPstn, isAvailable, getClient };
