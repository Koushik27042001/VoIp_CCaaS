import twilio from "twilio";
import { asyncHandler } from "../../middlewares/async.middleware.js";
import * as callRepo from "../../repositories/call.repository.js";
import { emitCallEnded, emitCallFailed } from "../../events/call.events.js";
import { getIO } from "../../socket.js";
import logger from "../../telemetry/logger.js";
import {
  twilioConfig,
  agentClientIdentity,
  isTwilioEnabled,
} from "../../config/twilio.js";

const VoiceResponse = twilio.twiml.VoiceResponse;
const MessagingResponse = twilio.twiml.MessagingResponse;

const shouldValidateWebhook =
  process.env.NODE_ENV === "production" ||
  process.env.TWILIO_VALIDATE_WEBHOOKS === "true";

export const twilioWebhookMiddleware = twilio.webhook({
  validate: shouldValidateWebhook,
  authToken: twilioConfig.authToken,
});

const mapTwilioStatus = (status) => {
  const map = {
    completed: "ended",
    busy: "ended",
    failed: "ended",
    "no-answer": "ended",
    canceled: "ended",
    ringing: "ringing",
    "in-progress": "connected",
    answered: "connected",
  };
  return map[status] || "ringing";
};

const statusCallbackUrl = (callId) =>
  `${twilioConfig.webhookBaseUrl}/api/webhooks/twilio/status?callId=${encodeURIComponent(callId || "")}`;

const sendVoiceTwiml = (res, builder) => {
  const response = new VoiceResponse();
  builder(response);
  res.type("text/xml");
  res.send(response.toString());
};

const updateCallFromWebhook = async ({ callId, CallStatus, CallDuration, CallSid }) => {
  if (!callId) return;

  const call = await callRepo.findCallByCallId(callId);
  if (!call) return;

  const updates = {
    status: mapTwilioStatus(CallStatus),
    externalId: CallSid,
  };

  if (CallStatus === "in-progress" || CallStatus === "answered") {
    updates.startTime = new Date();
  }

  if (["completed", "busy", "failed", "no-answer", "canceled"].includes(CallStatus)) {
    updates.endTime = new Date();
    updates.duration = Number(CallDuration) || 0;
    updates.disposition =
      CallStatus === "completed"
        ? "completed"
        : CallStatus === "no-answer"
          ? "missed"
          : "failed";

    await callRepo.updateCallByCallId(callId, updates);

    if (CallStatus === "completed") {
      emitCallEnded({
        callId,
        duration: updates.duration,
        disposition: updates.disposition,
      });
    } else {
      emitCallFailed({
        callId,
        reason: CallStatus,
      });
    }

    try {
      getIO().emit("call_ended", { ...call, ...updates });
    } catch {
      // ignore
    }
    return;
  }

  if (CallStatus === "in-progress" || CallStatus === "answered") {
    await callRepo.updateCallByCallId(callId, updates);
    try {
      getIO().emit("call_connected", { ...call, ...updates });
    } catch {
      // ignore
    }
    return;
  }

  await callRepo.updateCallByCallId(callId, updates);
};

/** REST outbound: customer answered → bridge to browser agent */
export const outboundVoiceTwiml = (req, res) => {
  const { callId, agentId } = req.query;
  const identity = agentClientIdentity(agentId || "unknown");

  sendVoiceTwiml(res, (response) => {
    response.say({ voice: "alice" }, "Connecting you to an agent.");
    const dial = response.dial({
      action: statusCallbackUrl(callId),
      method: "POST",
    });
    dial.client(identity);
  });
};

/** Browser agent initiated outbound via Twilio Voice SDK */
export const clientVoiceTwiml = (req, res) => {
  const { To, callId } = req.body;
  const destination = To || req.query.To;

  if (!destination) {
    sendVoiceTwiml(res, (response) => {
      response.say("No destination number was provided.");
      response.hangup();
    });
    return;
  }

  sendVoiceTwiml(res, (response) => {
    const dial = response.dial({
      callerId: twilioConfig.phoneNumber,
      action: statusCallbackUrl(callId),
      method: "POST",
    });
    dial.number(
      {
        statusCallback: statusCallbackUrl(callId),
        statusCallbackMethod: "POST",
        statusCallbackEvent: "initiated ringing answered completed",
      },
      destination
    );
  });
};

/** Inbound calls to your Twilio phone number */
export const inboundVoiceTwiml = (req, res) => {
  const from = req.body.From || "unknown caller";

  logger.info({ from, to: req.body.To }, "Inbound Twilio voice call");

  sendVoiceTwiml(res, (response) => {
    response.say({ voice: "alice" }, "Thank you for calling. Please hold while we connect you.");
    response.dial({ callerId: from }).client("agent_queue");
  });
};

/** SMS inbound webhook */
export const inboundSmsWebhook = (req, res) => {
  const from = req.body.From || "unknown";
  const body = req.body.Body || "";

  logger.info({ from, body }, "Inbound Twilio SMS");

  const response = new MessagingResponse();
  response.message(
    "Thanks for your message. Our team will follow up shortly. Reply STOP to opt out."
  );

  res.type("text/xml");
  res.send(response.toString());
};

export const callStatusWebhook = asyncHandler(async (req, res) => {
  const { CallStatus, CallDuration, CallSid } = req.body;
  const { callId } = req.query;

  logger.info(
    { callId, CallStatus, CallSid, CallDuration },
    "Twilio status webhook"
  );

  await updateCallFromWebhook({ callId, CallStatus, CallDuration, CallSid });

  res.sendStatus(204);
});

export const getTwilioConsoleConfig = (_req, res) => {
  const base = twilioConfig.webhookBaseUrl;

  res.json({
    success: true,
    data: {
      configured: isTwilioEnabled(),
      phoneNumber: twilioConfig.phoneNumber,
      console: {
        voiceWebhook: `${base}/api/webhooks/twilio/voice/inbound`,
        voiceMethod: "POST",
        messagingWebhook: `${base}/api/webhooks/twilio/sms/inbound`,
        messagingMethod: "POST",
        twimlAppVoiceUrl: `${base}/api/webhooks/twilio/voice/client`,
        twimlAppVoiceMethod: "POST",
        statusCallback: `${base}/api/webhooks/twilio/status`,
      },
      note:
        "Replace demo.twilio.com URLs in Twilio Console with the webhook URLs above. PUBLIC_API_URL must be publicly reachable (use ngrok for local dev).",
    },
  });
};
