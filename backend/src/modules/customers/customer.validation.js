import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const phone = z.string().trim().min(7).max(32);

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(120),
    phone,
    email: z.string().trim().email().optional().or(z.literal("")),
    company: z.string().trim().max(120).optional().or(z.literal("")),
    tags: z.array(z.string().trim().max(40)).max(20).optional(),
    notes: z.string().trim().max(5000).optional(),
    assignedAgent: objectId.optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({ id: objectId }),
  body: createCustomerSchema.shape.body.partial(),
});

export const customerPhoneSchema = z.object({
  params: z.object({ phone }),
});

export const listCustomersSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).max(10000).optional(),
  }),
});

export const searchCustomersSchema = z.object({
  query: z.object({
    query: z.string().trim().min(1).max(120),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});
