import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(10, "Phone must be at least 10 characters")
  .max(20, "Phone is too long");

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  email: z
    .union([z.string().trim().email(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  company: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const phoneParamSchema = z.object({
  phone: phoneSchema,
});

export const customerIdParamSchema = z.object({
  id: z.string().min(1, "Customer id is required"),
});

export const searchQuerySchema = z.object({
  query: z.string().trim().min(1, "Search query is required"),
});
