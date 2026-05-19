import { registerSipAgent, unregisterSipAgent } from "./sipClient";

export const startSipRegistration = async (handlers) => registerSipAgent(handlers);

export const stopSipRegistration = async () => unregisterSipAgent();
