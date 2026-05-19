import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import * as callRepo from "../../repositories/call.repository.js";
import * as customerRepo from "../../repositories/customer.repository.js";
import { dialOutbound } from "../../services/outboundCall.service.js";
import {
  emitCallStarted,
  emitCallEnded,
  emitCallFailed,
} from "../../events/call.events.js";
import logger from "../../telemetry/logger.js";

const normalizePhone = (phone) => phone.replace(/[\s-]/g, "").trim();

export const makeCall = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const agentId = req.user.id;
  const normalizedPhone = normalizePhone(phone);

  const customer = await customerRepo.getCustomerByPhone(normalizedPhone);
  const callId = `call_${Date.now()}_${agentId}`;

  const callRecord = await callRepo.createCall({
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
    const result = await dialOutbound({
      phone: normalizedPhone,
      agentId,
      callId,
    });

    const updated = await callRepo.updateCallByCallId(callId, {
      provider: result.provider,
      externalId: result.externalId,
    });

    logger.info(
      { callId, provider: result.provider, phone: normalizedPhone },
      "Outbound call initiated"
    );

    res.json({
      message: "Call initiated",
      callId,
      provider: result.provider,
      call: updated,
    });
  } catch (err) {
    await callRepo.updateCallByCallId(callId, {
      status: "ended",
      disposition: "failed",
      endTime: new Date(),
    });

    emitCallFailed({ callId, phone: normalizedPhone, reason: err.message });
    throw err;
  }
});

export const getCallHistory = asyncHandler(async (req, res) => {
  const calls = await callRepo.listCalls();
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
