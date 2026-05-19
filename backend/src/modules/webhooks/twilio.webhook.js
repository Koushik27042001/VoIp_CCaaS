import { asyncHandler } from "../../middlewares/async.middleware.js";
import * as callRepo from "../../repositories/call.repository.js";
import { emitCallEnded, emitCallFailed } from "../../events/call.events.js";
import { getIO } from "../../socket.js";
import logger from "../../telemetry/logger.js";

const mapTwilioStatus = (status) => {
  const map = {
    completed: "ended",
    busy: "ended",
    failed: "ended",
    "no-answer": "ended",
    canceled: "ended",
    ringing: "ringing",
    "in-progress": "connected",
  };
  return map[status] || "ringing";
};

export const outboundVoiceTwiml = (req, res) => {
  res.type("text/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting your call.</Say>
  <Pause length="1"/>
</Response>`);
};

export const callStatusWebhook = asyncHandler(async (req, res) => {
  const { CallStatus, CallDuration, CallSid } = req.body;
  const { callId } = req.query;

  logger.info(
    { callId, CallStatus, CallSid, CallDuration },
    "Twilio status webhook"
  );

  if (callId) {
    const call = await callRepo.findCallByCallId(callId);

    if (call) {
      const updates = {
        status: mapTwilioStatus(CallStatus),
        externalId: CallSid,
      };

      if (CallStatus === "in-progress") {
        updates.startTime = new Date();
      }

      if (["completed", "busy", "failed", "no-answer", "canceled"].includes(CallStatus)) {
        updates.endTime = new Date();
        updates.duration = Number(CallDuration) || 0;
        updates.disposition =
          CallStatus === "completed" ? "completed" : CallStatus === "no-answer" ? "missed" : "failed";

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
      } else if (CallStatus === "in-progress") {
        try {
          getIO().emit("call_connected", { ...call, ...updates });
        } catch {
          // ignore
        }
      }
    }
  }

  res.sendStatus(204);
});
