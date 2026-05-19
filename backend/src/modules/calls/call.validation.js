import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const phone = z.string().trim().min(7).max(32);

export const outboundCallSchema = z.object({
  body: z.object({
    phone,
    customerId: objectId.optional(),
  }),
});

export const callHistorySchema = z.object({
  query: z.object({
    agentId: objectId.optional(),
    status: z
      .enum(["waiting", "ringing", "connected", "active", "ended", "failed"])
      .optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const callNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1).max(64),
  }),
  body: z.object({
    notes: z.string().trim().max(5000).optional().default(""),
    disposition: z.enum(["completed", "missed", "failed"]).optional(),
  }),
});

export const endCallSchema = z.object({
  params: z.object({
    id: z.string().min(1).max(64),
  }),
  body: z.object({
    disposition: z.enum(["completed", "missed", "failed"]).optional(),
  }),
});
