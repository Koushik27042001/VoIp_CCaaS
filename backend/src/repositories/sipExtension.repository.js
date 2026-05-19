import SipExtension from "../models/SipExtension.js";

export const findByUserId = async (userId) => {
  return SipExtension.findOne({ userId }).lean();
};

export const findByExtension = async (extension) => {
  return SipExtension.findOne({ extension }).lean();
};

export const upsertForUser = async (userId, payload) => {
  return SipExtension.findOneAndUpdate({ userId }, payload, {
    upsert: true,
    new: true,
    runValidators: true,
  }).lean();
};

export const updateStatus = async (extension, status, extra = {}) => {
  return SipExtension.findOneAndUpdate(
    { extension },
    { status, ...extra },
    { new: true }
  ).lean();
};

export const listExtensions = async () => {
  return SipExtension.find()
    .populate("userId", "name email role")
    .lean();
};
