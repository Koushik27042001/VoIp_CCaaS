import Call from "../models/Call.js";

export const createCall = async (payload) => {
  return Call.create(payload);
};

export const findCallById = async (id) => {
  return Call.findById(id).lean();
};

export const findCallByCallId = async (callId) => {
  return Call.findOne({ callId }).lean();
};

export const updateCall = async (id, payload) => {
  return Call.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const updateCallByCallId = async (callId, payload) => {
  return Call.findOneAndUpdate({ callId }, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getCallsSince = async (since) => {
  return Call.find({ startTime: { $gte: since } }).lean();
};

export const getCallsByAgent = async (agentId) => {
  return Call.find({ agentId }).sort({ startTime: -1 }).lean();
};

export const getTodayCalls = async () => {
  return getCallsSince(startOfToday());
};

export const listCalls = async ({ limit = 100, skip = 0 } = {}) => {
  return Call.find()
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};
