import eventBus from "./eventBus.js";

export const SIP_REGISTERED = "sip.registered";
export const SIP_UNREGISTERED = "sip.unregistered";
export const SIP_INVITE = "sip.invite";
export const SIP_FAILED = "sip.failed";

export const emitSipRegistered = (payload) => {
  eventBus.emit(SIP_REGISTERED, payload);
};

export const emitSipUnregistered = (payload) => {
  eventBus.emit(SIP_UNREGISTERED, payload);
};

export const emitSipInvite = (payload) => {
  eventBus.emit(SIP_INVITE, payload);
};

export const emitSipFailed = (payload) => {
  eventBus.emit(SIP_FAILED, payload);
};
