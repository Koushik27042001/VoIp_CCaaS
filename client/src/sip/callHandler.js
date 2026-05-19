import {
  answerIncomingCall,
  endSipCall,
  getActiveSipSession,
  makeSipCall,
} from "./sipClient";

export const placeSipCall = async (target, handlers) => makeSipCall(target, handlers);

export const answerSipCall = async () => answerIncomingCall();

export const hangupSipCall = async () => endSipCall();

export const hasActiveSipCall = () => Boolean(getActiveSipSession());
