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
  if (phone.startsWith("+")) return phone.replace(/\s+/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
};

/**
 * Place PSTN outbound call to a mobile/landline via Twilio REST API.
 * When the customer answers, TwiML bridges the call to the agent browser client.
 */
export const dialPstn = async ({ to, callId, agentId }) => {
  const twilioClient = getClient();
  if (!twilioClient) {
    throw new Error("Twilio is not configured");
  }

  const statusCallback = `${twilioConfig.webhookBaseUrl}/api/webhooks/twilio/status?callId=${encodeURIComponent(callId)}`;
  const voiceUrl = `${twilioConfig.webhookBaseUrl}/api/webhooks/twilio/voice/outbound?callId=${encodeURIComponent(callId)}&agentId=${encodeURIComponent(agentId)}`;

  const call = await twilioClient.calls.create({
    to: normalizeE164(to),
    from: twilioConfig.phoneNumber,
    url: voiceUrl,
    method: "POST",
    statusCallback,
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
  });

  logger.info({ callSid: call.sid, callId, to, agentId }, "Twilio PSTN call initiated");

  return {
    provider: "twilio",
    externalId: call.sid,
    status: call.status,
    mode: "rest",
  };
};

export const cancelCall = async (externalId) => {
  const twilioClient = getClient();
  if (!twilioClient || !externalId) {
    return null;
  }

  const call = await twilioClient.calls(externalId).update({ status: "completed" });
  logger.info({ callSid: externalId }, "Twilio call ended by API");
  return call;
};

export const isAvailable = () => isTwilioEnabled();

export default { dialPstn, cancelCall, isAvailable, getClient };
