import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
const SOCKET_KEY = "__VOIP_CCAAS_SOCKET__";
const LISTENERS_KEY = "__VOIP_CCAAS_SOCKET_LISTENERS__";

const getSocketRef = () => {
  if (!globalThis[SOCKET_KEY]) {
    globalThis[SOCKET_KEY] = null;
  }

  return {
    get current() {
      return globalThis[SOCKET_KEY];
    },
    set current(value) {
      globalThis[SOCKET_KEY] = value;
    },
  };
};

export const initSocket = () => {
  const socketRef = getSocketRef();

  if (socketRef.current) {
    return socketRef.current;
  }

  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    autoConnect: true,
  });

  if (!globalThis[LISTENERS_KEY]) {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    globalThis[LISTENERS_KEY] = true;
  }

  socketRef.current = socket;

  return socket;
};

export const getSocket = () => {
  const socketRef = getSocketRef();
  return socketRef.current || initSocket();
};

export const disconnectSocket = () => {
  const socketRef = getSocketRef();

  if (!socketRef.current) return;

  socketRef.current.removeAllListeners();
  socketRef.current.disconnect();
  socketRef.current = null;
  globalThis[LISTENERS_KEY] = false;
};
