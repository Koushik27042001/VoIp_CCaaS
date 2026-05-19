import crypto from "node:crypto";
import Call from "../models/Call.js";
import CallEvent from "../models/CallEvent.js";
import { getCustomerByPhoneNumber } from "./crmService.js";
import { emitRealtimeEvent, REALTIME_EVENTS } from "../events/realtime.events.js";

const CALL_SELECT =
  "callId phone agentId customerId status duration startTime endTime notes disposition createdAt updatedAt";

export const calculateCallDuration = (startTime, endTime) => {
  return Math.max(0, Math.floor((endTime - startTime) / 1000));
};

export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

export const createCallEvent = async (call, eventType, metadata = {}) => {
  return CallEvent.create({
    callId: call._id,
    eventType,
    metadata,
  });
};

export const createOutboundCall = async ({ phone, agentId, customerId }) => {
  const customer = customerId ? null : await getCustomerByPhoneNumber(phone);
  const call = await Call.create({
    callId: `call_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    phone,
    agentId,
    customerId: customerId || customer?._id,
    status: "ringing",
    startTime: new Date(),
  });

  await createCallEvent(call, "initiated", { direction: "outbound" });

  const payload = {
    ...call.toObject(),
    customer: customer || null,
  };

  emitRealtimeEvent(REALTIME_EVENTS.CALL_STARTED, payload);
  emitRealtimeEvent(REALTIME_EVENTS.CALL_RINGING, payload);

  return payload;
};

export const listCallHistory = async ({ agentId, status, limit = 20 } = {}) => {
  const filter = {};

  if (agentId) filter.agentId = agentId;
  if (status) filter.status = status;

  return Call.find(filter)
    .select(CALL_SELECT)
    .populate("customerId", "name phone company tags")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const getActiveCalls = async () => {
  return Call.find({ status: { $in: ["waiting", "ringing", "connected", "active"] } })
    .select(CALL_SELECT)
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
};

export const addNoteToCall = async ({ id, notes, disposition }) => {
  const filter = id.match(/^[a-f\d]{24}$/i) ? { _id: id } : { callId: id };
  const call = await Call.findOneAndUpdate(
    filter,
    { notes, disposition },
    { new: true, runValidators: true }
  ).select(CALL_SELECT);

  if (!call) return null;

  await createCallEvent(call, "note_added", { disposition });
  const payload = call.toObject();
  emitRealtimeEvent(REALTIME_EVENTS.CALL_NOTE_ADDED, payload);

  return payload;
};

export const endCall = async ({ id, disposition = "completed" }) => {
  const endTime = new Date();
  const filter = id.match(/^[a-f\d]{24}$/i) ? { _id: id } : { callId: id };
  const call = await Call.findOne(filter);

  if (!call) return null;

  call.status = "ended";
  call.endTime = endTime;
  call.duration = calculateCallDuration(call.startTime, endTime);
  call.disposition = disposition;
  await call.save();
  await createCallEvent(call, "ended", { disposition });

  const payload = call.toObject();
  emitRealtimeEvent(REALTIME_EVENTS.CALL_ENDED, payload);

  return payload;
};

export default {
  calculateCallDuration,
  formatDuration,
  createOutboundCall,
  listCallHistory,
  getActiveCalls,
  addNoteToCall,
  endCall,
};
