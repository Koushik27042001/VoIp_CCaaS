export const validate =
  (schema) =>
  async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      req.validated = parsed;
      req.body = parsed.body ?? req.body;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      const details = error.issues?.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        message: "Validation failed",
        details: details || [{ message: error.message }],
      });
    }
  };
