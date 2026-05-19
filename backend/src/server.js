import "./config/env.js";
import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { isMockMode } from "./config/env.js";
import { initSocket } from "./socket.js";
import logger from "./utils/logger.js";

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

initSocket(server);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    logger.error(
      {
        port: PORT,
      },
      `Port ${PORT} is already in use. Stop the existing backend process or set a different PORT in backend/.env.`
    );
    process.exit(1);
  }

  logger.error({ err: error }, "HTTP server failed");
  process.exit(1);
});

const startServer = async () => {
  if (!isMockMode()) {
    await connectDB();
  }

  server.listen(PORT, () => {
    logger.info(
      {
        port: PORT,
        mode: isMockMode() ? "mock" : "production",
      },
      "VoIP CCaaS backend started"
    );
  });
};

const shutdown = async (signal) => {
  logger.info({ signal }, "Shutting down backend");
  server.close(async () => {
    await mongoose.connection.close(false);
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
