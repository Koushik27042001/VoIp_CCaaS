import eventBus from "../events/eventBus.js";
import { getIO } from "../socket.js";
import logger from "../telemetry/logger.js";
import {
  SIP_REGISTERED,
  SIP_UNREGISTERED,
  SIP_INVITE,
  SIP_FAILED,
} from "../events/sip.events.js";
import {
  CALL_STARTED,
  CALL_ENDED,
  CALL_FAILED,
} from "../events/call.events.js";

const broadcast = (event, payload) => {
  try {
    getIO().emit(event, payload);
  } catch {
    // Socket not ready during tests
  }
};

const onSipRegistered = (payload) => {
  logger.info({ extension: payload?.extension }, "SIP extension registered");
  broadcast("sip_registered", payload);
};

const onSipUnregistered = (payload) => {
  logger.info({ extension: payload?.extension }, "SIP extension unregistered");
  broadcast("sip_unregistered", payload);
};

const onSipInvite = (payload) => {
  logger.info({ extension: payload?.extension }, "SIP INVITE");
  broadcast("sip_invite", payload);
};

const onSipFailed = (payload) => {
  logger.warn({ extension: payload?.extension, reason: payload?.reason }, "SIP failed");
  broadcast("sip_failed", payload);
};

const onCallStarted = (payload) => {
  broadcast("call_ringing", payload);
};

const onCallEnded = (payload) => {
  broadcast("call_ended", payload);
};

const onCallFailed = (payload) => {
  broadcast("call_failed", payload);
};

export const registerPbxWorkers = () => {
  eventBus.on(SIP_REGISTERED, onSipRegistered);
  eventBus.on(SIP_UNREGISTERED, onSipUnregistered);
  eventBus.on(SIP_INVITE, onSipInvite);
  eventBus.on(SIP_FAILED, onSipFailed);
  eventBus.on(CALL_STARTED, onCallStarted);
  eventBus.on(CALL_ENDED, onCallEnded);
  eventBus.on(CALL_FAILED, onCallFailed);

  logger.debug("PBX event workers registered");
};
