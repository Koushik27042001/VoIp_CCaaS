import express from "express";
import { z } from "zod";
import { setupFirstAdmin, login, getMe } from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../../validators/auth.validator.js";

const router = express.Router();

router.post(
  "/setup",
  validate(z.object({ body: registerSchema })),
  setupFirstAdmin
);

router.post(
  "/login",
  validate(z.object({ body: loginSchema })),
  login
);

router.get("/me", protect, getMe);

export default router;
