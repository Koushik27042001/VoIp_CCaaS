import { z } from "zod";

/**
 * Validates req.body, req.params, and/or req.query against a Zod object schema.
 *
 * @example
 * validate(z.object({ body: registerSchema }))
 * validate(z.object({ params: phoneParamSchema }))
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const { body, params, query } = result.data;

  if (body !== undefined) req.body = body;
  if (params !== undefined) req.params = params;
  if (query !== undefined) req.query = query;

  next();
};

export const validateBody = (bodySchema) =>
  validate(z.object({ body: bodySchema }));

export const validateParams = (paramsSchema) =>
  validate(z.object({ params: paramsSchema }));

export const validateQuery = (querySchema) =>
  validate(z.object({ query: querySchema }));
