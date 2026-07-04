import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";
const redactPaths = [
  "req.headers.authorization",
  "headers.authorization",
  "authorization",
  "password",
  "*.password",
  "passwordHash",
  "*.passwordHash",
  "token",
  "*.token",
  "accessToken",
  "refreshToken",
  "authToken",
  "*.authToken",
  "apiKey",
  "*.apiKey",
  "apiSecret",
  "*.apiSecret",
  "secret",
  "*.secret",
  "MONGO_URI",
  "MONGODB_URI",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_API_SECRET",
];

const redact = {
  paths: redactPaths,
  censor: "[REDACTED]",
};

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  redact,
  serializers: {
    err: (err) => {
      if (!err) return err;
      if (isDev) {
        return pino.stdSerializers.err(err);
      }
      return {
        type: err.name,
        message: err.message,
        code: err.code,
        status: err.status || err.statusCode,
      };
    },
  },
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
  base: {
    service: "voip-ccaas-backend",
    env: process.env.NODE_ENV || "development",
  },
});

export default logger;
