import { Server } from "socket.io";
import logger from "./utils/logger.js";

let io;

const SIGNALING_EVENTS = [
  "webrtc_offer",
  "webrtc_answer",
  "webrtc_ice_candidate",
  "webrtc_call_ended",
];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || "*",
    },
    maxHttpBufferSize: Number(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE || 1e6),
    pingTimeout: Number(process.env.SOCKET_PING_TIMEOUT_MS || 20000),
    pingInterval: Number(process.env.SOCKET_PING_INTERVAL_MS || 25000),
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Socket connected");

    for (const eventName of SIGNALING_EVENTS) {
      socket.on(eventName, (data = {}) => {
        socket.broadcast.emit(eventName, {
          ...data,
          from: socket.id,
        });
      });
    }

    socket.on("agent_status", (data = {}) => {
      io.emit("agent_status_update", {
        agentId: data.agentId || socket.id,
        status: data.status,
        updatedAt: new Date().toISOString(),
      });
    });

    socket.on("disconnect", (reason) => {
      socket.removeAllListeners();
      logger.info({ socketId: socket.id, reason }, "Socket disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
