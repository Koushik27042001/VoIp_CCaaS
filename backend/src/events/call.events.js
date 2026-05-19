import eventBus from "./eventBus.js";

export const CALL_STARTED = "call.started";
export const CALL_ENDED = "call.ended";
export const CALL_FAILED = "call.failed";

export const emitCallStarted = (payload) => {
  eventBus.emit(CALL_STARTED, payload);
};

export const emitCallEnded = (payload) => {
  eventBus.emit(CALL_ENDED, payload);
};

export const emitCallFailed = (payload) => {
  eventBus.emit(CALL_FAILED, payload);
};
