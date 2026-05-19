import express from "express";
import {
  createSipTrunk,
  deleteSipTrunk,
  getSipTrunk,
  getSipTrunks,
  regenerateSipTrunkConfig,
  updateSipTrunk,
} from "./sipTrunk.controller.js";

const router = express.Router();

router.post("/", createSipTrunk);
router.get("/", getSipTrunks);
router.post("/regenerate-config", regenerateSipTrunkConfig);
router.get("/:id", getSipTrunk);
router.put("/:id", updateSipTrunk);
router.delete("/:id", deleteSipTrunk);

export default router;
