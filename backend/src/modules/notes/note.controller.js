import { asyncHandler } from "../../middlewares/async.middleware.js";
import { AppError } from "../../middlewares/error.middleware.js";
import * as noteRepo from "../../repositories/note.repository.js";

export const createNote = asyncHandler(async (req, res) => {
  const { customerId, callId, content, type } = req.body;
  const agentId = req.user?.id;

  if (!agentId) {
    throw new AppError("Unauthorized", 401);
  }

  const note = await noteRepo.createNote({
    customerId,
    callId,
    content,
    type,
    agentId,
  });

  res.status(201).json({ message: "Note created", note });
});

export const getNotesByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const notes = await noteRepo.findNotesByCustomerId(customerId);
  res.json(notes);
});
