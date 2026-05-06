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
