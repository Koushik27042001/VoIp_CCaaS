import { io } from "socket.io-client";

let socket = null;
let isInitializing = false;

export const initSocket = () => {
  if (socket && socket.connected) {
    console.log("🔄 Socket already connected, returning existing socket");
    return socket;
  }

  if (isInitializing) {
    console.log("🔄 Socket initialization in progress...");
    return null;
  }

  console.log("🚀 Initializing new socket connection...");
  isInitializing = true;

  socket = io("http://localhost:5000", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    transports: ["websocket"],
    forceNew: false, // Don't force new connection
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("✅ Connected to server:", socket.id, "Time:", new Date().toISOString());
    isInitializing = false;
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected from server:", reason, "Time:", new Date().toISOString());
    isInitializing = false;
  });

  socket.on("connect_error", (error) => {
    console.error("🔌 Connection error:", error);
    isInitializing = false;
  });

  socket.on("error", (error) => {
    console.error("🔌 Socket error:", error);
    isInitializing = false;
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`🔄 Reconnected to server (attempt ${attemptNumber})`);
  });

  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}`);
  });

  socket.on("reconnect_error", (error) => {
    console.error("🔄 Reconnection failed:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("🔄 All reconnection attempts failed");
  });

  return socket;
};

export const getSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    console.log("📡 Returning existing socket (connecting or disconnected)");
    return socket;
  }

  console.log("📡 Socket not initialized, initializing now...");
  return initSocket();
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.disconnect();
    socket = null;
    isInitializing = false;
  }
};

export default getSocket;
