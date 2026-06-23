import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { initSocket } from "./socket.js";
import { connectDB } from "./config/db.js";
import { registerEventListeners } from "./events/index.js";
import logger from "./telemetry/logger.js";

dotenv.config();

const startServer = async () => {
  const isMockMode = process.env.USE_MOCK === "true";
  const allowStartWithoutDb = process.env.ALLOW_START_WITHOUT_DB === "true";
  const dbRequired = !isMockMode && !allowStartWithoutDb;

  const dbStatus = await connectDB({ required: dbRequired });
  if (!dbStatus.connected) {
    logger.warn(
      "Starting without MongoDB connection. DB-backed endpoints may return errors."
    );
  }

  registerEventListeners();

  const server = http.createServer(app);
  initSocket(server);

  const preferredPort = Number(process.env.PORT || 5000);
  const autoPortFallback =
    process.env.AUTO_PORT_FALLBACK !== "false" &&
    process.env.NODE_ENV !== "production";
  let listenPort = preferredPort;
  let portRetryCount = 0;

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && autoPortFallback && portRetryCount < 20) {
      portRetryCount += 1;
      listenPort = preferredPort + portRetryCount;
      logger.warn(
        { preferredPort, selectedPort: listenPort },
        "Port is busy; retrying with next port"
      );
      server.listen(listenPort);
      return;
    }

    if (error.code === "EADDRINUSE") {
      logger.error(
        { port: listenPort },
        `Port ${listenPort} is already in use. Stop the existing process or set a different PORT.`
      );
      process.exit(1);
    }

    logger.error({ err: error }, "HTTP server failed");
    process.exit(1);
  });

  server.listen(listenPort, () => {
    logger.info(
      {
        port: listenPort,
        env: process.env.NODE_ENV,
        mockMode: isMockMode,
        allowStartWithoutDb,
      },
      "Server started"
    );
  });
};

startServer().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
