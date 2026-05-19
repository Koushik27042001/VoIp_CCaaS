import express from "express";
import { z } from "zod";
import { protect } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createAgentSchema,
  updateAgentStatusSchema,
} from "../../validators/user.validator.js";
import {
  createAgent,
  listAgents,
  updateAgentStatus,
  deleteAgent,
} from "./user.controller.js";

const router = express.Router();

router.use(protect);

router.post(
  "/agents",
  authorize("admin"),
  validate(z.object({ body: createAgentSchema })),
  createAgent
);

router.get("/agents", authorize("admin"), listAgents);

router.patch(
  "/agents/:id/status",
  validate(z.object({ body: updateAgentStatusSchema })),
  updateAgentStatus
);

router.delete("/agents/:id", authorize("admin"), deleteAgent);

export default router;
