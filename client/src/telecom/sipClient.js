import { UserAgent, Registerer } from "sip.js";

let userAgent = null;
let registerer = null;

export const getSipState = () => ({
  userAgent,
  registerer,
  isRegistered: registerer?.state === "Registered",
});

/**
 * Register browser agent to Asterisk via WebSocket (SIP.js).
 */
export const registerSipAgent = async (config, { onStateChange } = {}) => {
  await unregisterSipAgent();

  const uri = UserAgent.makeURI(config.uri);
  if (!uri) {
    throw new Error(`Invalid SIP URI: ${config.uri}`);
  }

  userAgent = new UserAgent({
    uri,
    transportOptions: {
      server: config.wsServer,
    },
    authorizationUsername: config.extension,
    authorizationPassword: config.password,
    displayName: config.displayName || config.extension,
    sessionDescriptionHandlerFactoryOptions: {
      peerConnectionConfiguration: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    },
  });

  await userAgent.start();

  registerer = new Registerer(userAgent);

  if (onStateChange) {
    registerer.stateChange.addListener(onStateChange);
  }

  await registerer.register();

  return { userAgent, registerer };
};

export const unregisterSipAgent = async () => {
  if (registerer) {
    try {
      await registerer.unregister();
    } catch {
      // already unregistered
    }
    registerer = null;
  }

  if (userAgent) {
    try {
      await userAgent.stop();
    } catch {
      // ignore
    }
    userAgent = null;
  }
};
