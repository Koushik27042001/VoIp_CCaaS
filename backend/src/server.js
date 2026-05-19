import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { initSocket } from "./socket.js";
import { connectDB } from "./config/db.js";
import { registerEventListeners } from "./events/index.js";
import logger from "./telemetry/logger.js";

dotenv.config();

const startServer = async () => {
  await connectDB();
  registerEventListeners();

  const server = http.createServer(app);
  initSocket(server);

  const PORT = process.env.PORT || 5000;

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      logger.error(
        { port: PORT },
        `Port ${PORT} is already in use. Stop the existing process or set a different PORT.`
      );
      process.exit(1);
    }
    logger.error({ err: error }, "HTTP server failed");
    process.exit(1);
  });

  server.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, "Server started");
  });
};

startServer().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
