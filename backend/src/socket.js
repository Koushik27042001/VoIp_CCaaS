import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("webrtc_offer", (data = {}) => {
      socket.broadcast.emit("webrtc_offer", {
        ...data,
        from: socket.id,
      });
    });

    socket.on("webrtc_answer", (data = {}) => {
      socket.broadcast.emit("webrtc_answer", {
        ...data,
        from: socket.id,
      });
    });

    socket.on("webrtc_ice_candidate", (data = {}) => {
      socket.broadcast.emit("webrtc_ice_candidate", {
        ...data,
        from: socket.id,
      });
    });

    socket.on("webrtc_call_ended", (data = {}) => {
      socket.broadcast.emit("webrtc_call_ended", {
        ...data,
        from: socket.id,
      });
    });

    socket.on("agent_status", (data) => {
      console.log("👤 Agent status:", data);
      io.emit("agent_status_update", {
        agentId: socket.id,
        status: data.status,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
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
