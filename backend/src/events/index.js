import { registerAnalyticsListeners } from "./analytics.events.js";
import { registerPbxWorkers } from "../workers/pbxEvent.worker.js";

export const registerEventListeners = () => {
  registerAnalyticsListeners();
  registerPbxWorkers();
};

export {
  CALL_STARTED,
  CALL_ENDED,
  CALL_FAILED,
  emitCallStarted,
  emitCallEnded,
  emitCallFailed,
} from "./call.events.js";

export {
  SIP_REGISTERED,
  SIP_UNREGISTERED,
  SIP_INVITE,
  SIP_FAILED,
  emitSipRegistered,
  emitSipUnregistered,
  emitSipInvite,
  emitSipFailed,
} from "./sip.events.js";
