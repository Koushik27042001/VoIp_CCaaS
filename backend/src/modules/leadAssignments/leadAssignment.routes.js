import express from "express";
import { z } from "zod";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  addAssignmentNote,
  assignLead,
  getAssignments,
  getMyLeads,
  updateAssignmentStatus,
} from "./leadAssignment.controller.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const assignLeadSchema = z.object({
  customerId: objectId,
  assignedTo: objectId,
});

const statusSchema = z.object({
  status: z.enum(["new", "contacted", "interested", "closed"]),
});

const noteSchema = z.object({
  note: z.string().trim().min(1).max(1000),
});

const idParams = z.object({
  id: objectId,
});

const router = express.Router();

router.use(protect);

router.post(
  "/assign",
  authorize("admin"),
  validate(z.object({ body: assignLeadSchema })),
  assignLead
);

router.get("/", authorize("admin"), getAssignments);
router.get("/my-leads", getMyLeads);

router.patch(
  "/:id/status",
  validate(z.object({ params: idParams, body: statusSchema })),
  updateAssignmentStatus
);

router.post(
  "/:id/notes",
  validate(z.object({ params: idParams, body: noteSchema })),
  addAssignmentNote
);

export default router;
