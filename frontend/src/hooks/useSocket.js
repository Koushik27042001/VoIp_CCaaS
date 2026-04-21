import { useEffect } from "react";
import { getSocket } from "../utils/socket";

/**
 * Custom hook for safe Socket.io event listening
 * Automatically handles cleanup on unmount
 * @param {string} event - Socket event name
 * @param {Function} callback - Event handler
 * @param {Array} dependencies - useEffect dependencies (optional)
 */
export const useSocketEvent = (event, callback, dependencies = []) => {
  useEffect(() => {
    if (!event || !callback) return;

    const socket = getSocket();
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback, ...dependencies]);
};

/**
 * Custom hook for Socket.io connection state
 * Returns the socket instance - DO NOT disconnect it manually
 */
export const useSocket = () => {
  useEffect(() => {
    const socket = getSocket();
    
    return () => {
      // ✅ Only clean up event listeners, never disconnect the socket
      // Socket persists for the entire app lifetime
    };
  }, []);

  return getSocket();
};

export default useSocket;
