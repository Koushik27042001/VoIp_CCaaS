import express from "express";
import { z } from "zod";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registrationStatusSchema } from "../../validators/sip.validator.js";
import {
  getRegistrationConfig,
  postRegistrationStatus,
  getSipHealth,
  getExtensions,
} from "./sip.controller.js";

const router = express.Router();

router.get("/health", getSipHealth);

router.get("/config", protect, getRegistrationConfig);

router.post(
  "/registration",
  protect,
  validate(z.object({ body: registrationStatusSchema })),
  postRegistrationStatus
);

router.get("/extensions", protect, getExtensions);

export default router;
