import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import * as callRepo from "../../repositories/call.repository.js";
import * as customerRepo from "../../repositories/customer.repository.js";
import { dialOutbound, hangupOutbound } from "../../services/outboundCall.service.js";
import {
  isTwilioClientEnabled,
  isTwilioClientCallingEnabled,
} from "../../config/twilio.js";
import {
  emitCallStarted,
  emitCallFailed,
  emitCallEnded,
} from "../../events/call.events.js";
import logger from "../../telemetry/logger.js";

const normalizePhone = (phone) => phone.replace(/[\s-]/g, "").trim();

export const makeCall = asyncHandler(async (req, res) => {
  const { phone, mode = "auto" } = req.body;
  const agentId = req.user.id;
  const normalizedPhone = normalizePhone(phone);

  const customer = await customerRepo.getCustomerByPhone(normalizedPhone);
  const callId = `call_${Date.now()}_${agentId}`;

  await callRepo.createCall({
    callId,
    phone: normalizedPhone,
    agentId,
    customerId: customer?._id,
    status: "ringing",
  });

  emitCallStarted({
    callId,
    phone: normalizedPhone,
    agentId,
    status: "ringing",
  });

  try {
    const canUseClientCalling =
      isTwilioClientEnabled() && isTwilioClientCallingEnabled();
    const useClientMode =
      canUseClientCalling && (mode === "client" || mode === "auto");

    const result = await dialOutbound({
      phone: normalizedPhone,
      agentId,
      callId,
      mode: useClientMode ? "client" : "rest",
    });

    const updated = await callRepo.updateCallByCallId(callId, {
      provider: result.provider || "twilio",
      externalId: result.externalId || undefined,
    });

    logger.info(
      { callId, provider: result.provider, mode: result.mode, phone: normalizedPhone },
      "Outbound call initiated"
    );

    res.json({
      message: "Call initiated",
      callId,
      provider: result.provider,
      mode: result.mode || "rest",
      useTwilioClient: result.mode === "client",
      call: updated,
    });
  } catch (err) {
    await callRepo.updateCallByCallId(callId, {
      status: "ended",
      disposition: "failed",
      endTime: new Date(),
    });

    const providerAuthFailed = err?.code === 20003;
    const reason = providerAuthFailed
      ? "Twilio authentication failed. Re-check Account SID/Auth Token."
      : err.message;

    emitCallFailed({ callId, phone: normalizedPhone, reason });

    if (providerAuthFailed) {
      throw new AppError(reason, 400);
    }

    throw err;
  }
});

export const hangupCall = asyncHandler(async (req, res) => {
  const { callId } = req.body;

  const call = await callRepo.findCallByCallId(callId);
  if (!call) {
    throw new AppError("Call not found", 404);
  }

  if (call.agentId?.toString() !== req.user.id && req.user.role !== "admin") {
    throw new AppError("Not authorized to end this call", 403);
  }

  if (call.externalId) {
    await hangupOutbound({
      externalId: call.externalId,
      provider: call.provider,
    });
  }

  const updated = await callRepo.updateCallByCallId(callId, {
    status: "ended",
    endTime: new Date(),
    disposition: call.disposition || "completed",
  });

  emitCallEnded({
    callId,
    duration: updated?.duration || 0,
    disposition: updated?.disposition || "completed",
  });

  res.json({
    message: "Call ended",
    call: updated,
  });
});

export const getCallHistory = asyncHandler(async (req, res) => {
  const calls =
    req.user.role === "admin"
      ? await callRepo.listCalls()
      : await callRepo.getCallsByAgent(req.user.id);
  res.json(calls);
});

export const addCallNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, disposition } = req.body;

  let call = await callRepo.findCallById(id);
  if (!call) {
    call = await callRepo.findCallByCallId(id);
  }

  if (!call) {
    throw new AppError("Call not found", 404);
  }

  const updated = await callRepo.updateCall(call._id, { notes, disposition });
  res.json(updated);
});
