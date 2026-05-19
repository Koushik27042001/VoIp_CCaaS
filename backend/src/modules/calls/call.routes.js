import express from "express";
import {
  makeCall,
  getCallHistory,
  getActiveCallList,
  addCallNote,
  endActiveCall,
} from "./call.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  callHistorySchema,
  callNoteSchema,
  endCallSchema,
  outboundCallSchema,
} from "./call.validation.js";

const router = express.Router();

router.post("/outbound", protect, validate(outboundCallSchema), makeCall);
router.get("/active", protect, getActiveCallList);
router.get("/history", protect, validate(callHistorySchema), getCallHistory);
router.post("/:id/notes", protect, validate(callNoteSchema), addCallNote);
router.post("/:id/end", protect, validate(endCallSchema), endActiveCall);

export default router;
