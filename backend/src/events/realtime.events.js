import EventEmitter from "node:events";
import { getIO } from "../socket.js";
import logger from "../utils/logger.js";

export const realtimeEvents = new EventEmitter();

export const REALTIME_EVENTS = {
  CALL_STARTED: "call_started",
  CALL_RINGING: "call_ringing",
  CALL_CONNECTED: "call_connected",
  CALL_ENDED: "call_ended",
  CALL_NOTE_ADDED: "call_note_added",
  LEAD_UPDATED: "lead_updated",
  AGENT_STATUS: "agent_status_update",
};

export const emitRealtimeEvent = (eventName, payload) => {
  realtimeEvents.emit(eventName, payload);

  try {
    getIO().emit(eventName, payload);
  } catch (error) {
    logger.debug({ eventName }, "Socket server not ready for realtime event");
  }
};
