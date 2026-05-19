import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["agent", "admin"]).default("agent"),
  status: z.enum(["available", "on_call", "offline"]).optional(),
});

export const updateAgentStatusSchema = z.object({
  status: z.enum(["available", "on_call", "offline"]),
});
