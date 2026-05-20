import express from "express";
import { z } from "zod";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createLead, getLeads, updateLead } from "./lead.controller.js";

const leadSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  email: z.string().trim().email().optional().or(z.literal("")),
  company: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["new", "contacted", "interested", "closed"]).optional(),
});

const updateLeadSchema = leadSchema.partial();

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.post("/", validate(z.object({ body: leadSchema })), createLead);
router.get("/", getLeads);
router.patch("/:id", validate(z.object({ body: updateLeadSchema })), updateLead);

export default router;
