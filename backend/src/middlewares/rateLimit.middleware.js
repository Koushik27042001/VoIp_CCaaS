import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT_PER_MINUTE || 300),
  standardHeaders: true,
  legacyHeaders: false,
});

export const signalingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.SIGNALING_RATE_LIMIT_PER_MINUTE || 120),
  standardHeaders: true,
  legacyHeaders: false,
});
