import eventBus from "./eventBus.js";
import logger from "../telemetry/logger.js";
import { metrics } from "../telemetry/metrics.js";
import {
  CALL_STARTED,
  CALL_ENDED,
  CALL_FAILED,
} from "./call.events.js";

const onCallStarted = (payload) => {
  metrics.callStarted();
  logger.info({ event: CALL_STARTED, callId: payload?.callId }, "Call started");
};

const onCallEnded = (payload) => {
  metrics.callEnded();
  logger.info(
    {
      event: CALL_ENDED,
      callId: payload?.callId,
      duration: payload?.duration,
    },
    "Call ended"
  );
};

const onCallFailed = (payload) => {
  metrics.callFailed();
  logger.warn(
    { event: CALL_FAILED, callId: payload?.callId, reason: payload?.reason },
    "Call failed"
  );
};

export const registerAnalyticsListeners = () => {
  eventBus.on(CALL_STARTED, onCallStarted);
  eventBus.on(CALL_ENDED, onCallEnded);
  eventBus.on(CALL_FAILED, onCallFailed);

  logger.debug("Analytics event listeners registered");
};
