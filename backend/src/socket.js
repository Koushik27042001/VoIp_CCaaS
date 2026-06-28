import { Server } from "socket.io";
import logger from "./utils/logger.js";
import { getAllowedFrontendOrigins } from "./config/frontendOrigins.js";

let io;

const SIGNALING_EVENTS = [
  "webrtc_offer",
  "webrtc_answer",
  "webrtc_ice_candidate",
  "webrtc_call_ended",
];

const now = () => new Date().toISOString();

const resolveCallPayload = (socket, data = {}) => {
  const phone = data.phone || data.number || data.to || "";

  return {
    ...data,
    callId: data.callId || `socket_${socket.id}_${Date.now()}`,
    agentId: data.agentId || socket.id,
    phone,
    number: phone,
  };
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedFrontendOrigins(),
      credentials: true,
    },
    maxHttpBufferSize: Number(
      process.env.SOCKET_MAX_HTTP_BUFFER_SIZE || 1e6
    ),
    pingTimeout: Number(
      process.env.SOCKET_PING_TIMEOUT_MS || 20000
    ),
    pingInterval: Number(
      process.env.SOCKET_PING_INTERVAL_MS || 25000
    ),
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
      const payload = {
        agentId: data.agentId || socket.id,
        status: data.status,
        updatedAt: now(),
      };

      io.emit("agent_status_update", payload);
      io.emit("agent_status_changed", payload);
    });

    socket.on("start_call", (data = {}) => {
      const payload = {
        ...resolveCallPayload(socket, data),
        status: "ringing",
        source: "socket",
        startedAt: now(),
      };

      io.emit("call_ringing", payload);
    });

    socket.on("end_call", (data = {}) => {
      const payload = {
        ...resolveCallPayload(socket, data),
        status: "ended",
        endedAt: now(),
      };

      io.emit("call_ended", payload);
    });

    socket.on("incoming_call", (data = {}) => {
      io.emit("inbound_call", resolveCallPayload(socket, data));
    });

    socket.on("outgoing_call", (data = {}) => {
      io.emit("outgoing_call", resolveCallPayload(socket, data));
    });

    socket.on("call_finished", (data = {}) => {
      io.emit("call_finished", resolveCallPayload(socket, data));
      io.emit("call_ended", resolveCallPayload(socket, data));
    });

    socket.on("disconnect", (reason) => {
      socket.removeAllListeners();
      io.emit("agent_disconnected", {
        agentId: socket.id,
        updatedAt: now(),
      });
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
