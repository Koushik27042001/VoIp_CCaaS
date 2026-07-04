// Socket event handlers
import logger from "../telemetry/logger.js";

export const handleSocketEvents = (io, socket) => {
  // Agent status update
  socket.on("agent_status", (data) => {
    logger.debug({ socketId: socket.id, status: data?.status }, "Agent status update");
    io.emit("agent_status_changed", {
      agentId: socket.id,
      status: data.status,
      timestamp: new Date(),
    });
  });

  // Call incoming
  socket.on("incoming_call", (data) => {
    logger.debug({ socketId: socket.id, hasPayload: Boolean(data) }, "Incoming call event");
    io.emit("inbound_call", data);
  });

  // Call outgoing
  socket.on("outgoing_call", (data) => {
    logger.debug({ socketId: socket.id, hasPayload: Boolean(data) }, "Outgoing call event");
    io.emit("outgoing_call", data);
  });

  // Call ended
  socket.on("call_finished", (data) => {
    logger.debug({ socketId: socket.id, hasPayload: Boolean(data) }, "Call finished event");
    io.emit("call_finished", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Agent disconnected");
    io.emit("agent_disconnected", {
      agentId: socket.id,
      timestamp: new Date(),
    });
  });
};

export default handleSocketEvents;
