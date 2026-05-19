import { z } from "zod";

export const outboundCallSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, "Phone must be at least 10 characters"),
});

export const callNoteSchema = z.object({
  notes: z.string().trim().optional(),
  disposition: z
    .enum(["completed", "missed", "failed", ""])
    .optional(),
});

export const callIdParamSchema = z.object({
  id: z.string().min(1, "Call id is required"),
});
