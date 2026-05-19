import Note from "../models/Note.js";

export const createNote = async (payload) => {
  return Note.create(payload);
};

export const findNotesByCustomerId = async (customerId, { limit = 100 } = {}) => {
  return Note.find({ customerId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const findNotesByCallId = async (callId) => {
  return Note.find({ callId }).sort({ createdAt: -1 }).lean();
};
