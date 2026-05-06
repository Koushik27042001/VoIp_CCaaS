import { io } from "socket.io-client";

let socket = null;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const initSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket Connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket Disconnected");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) return initSocket();
  return socket;
};