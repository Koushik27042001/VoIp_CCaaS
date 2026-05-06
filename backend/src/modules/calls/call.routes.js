import express from "express";
import {
  makeCall,
  getCallHistory,
  addCallNote,
} from "./call.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/outbound", protect, makeCall);
router.get("/history", protect, getCallHistory);
router.post("/:id/notes", protect, addCallNote);

export default router;
