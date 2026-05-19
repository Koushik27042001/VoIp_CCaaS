import { z } from "zod";

export const registrationStatusSchema = z.object({
  extension: z.string().min(1),
  status: z.enum(["registered", "unregistered", "failed"]),
  contactUri: z.string().optional(),
});
