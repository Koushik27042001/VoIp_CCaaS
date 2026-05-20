import express from "express";
import { z } from "zod";
import {
  makeCall,
  hangupCall,
  getCallHistory,
  addCallNote,
} from "./call.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  outboundCallSchema,
  hangupCallSchema,
  callNoteSchema,
  callIdParamSchema,
} from "../../validators/call.validator.js";

const router = express.Router();

router.post(
  "/outbound",
  protect,
  validate(z.object({ body: outboundCallSchema })),
  makeCall
);

router.post(
  "/hangup",
  protect,
  validate(z.object({ body: hangupCallSchema })),
  hangupCall
);

router.get("/history", protect, getCallHistory);

router.post(
  "/:id/notes",
  protect,
  validate(
    z.object({
      params: callIdParamSchema,
      body: callNoteSchema,
    })
  ),
  addCallNote
);

export default router;
