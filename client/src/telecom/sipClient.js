import { UserAgent, Registerer, Inviter, SessionState } from "sip.js";

let userAgent = null;
let registerer = null;
let activeSession = null;

const validateRegistrationConfig = (config = {}) => {
  const requiredFields = ["extension", "password", "wsServer", "uri"];
  const missing = requiredFields.filter((field) => !String(config?.[field] || "").trim());

  if (missing.length > 0) {
    throw new Error(`Incomplete SIP config from backend. Missing: ${missing.join(", ")}`);
  }
};

export const getSipState = () => ({
  userAgent,
  registerer,
  isRegistered: registerer?.state === "Registered",
  activeSession,
});

/**
 * Register browser agent to Asterisk via WebSocket (SIP.js).
 */
export const registerSipAgent = async (config, { onStateChange } = {}) => {
  validateRegistrationConfig(config);
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

  try {
    await userAgent.start();
  } catch (error) {
    throw new Error(
      `SIP transport connection failed (${config.wsServer}): ${error?.message || "Unknown error"}`
    );
  }

  registerer = new Registerer(userAgent);

  if (onStateChange) {
    registerer.stateChange.addListener(onStateChange);
  }

  try {
    await registerer.register();
  } catch (error) {
    throw new Error(`SIP REGISTER failed for ${config.uri}: ${error?.message || "Unknown error"}`);
  }

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

  activeSession = null;
};

export const makeSipCall = async (target, handlers = {}) => {
  if (!userAgent) {
    throw new Error("SIP userAgent not initialized. Call registerSipAgent first.");
  }

  const domain = userAgent.configuration.uri.host;
  const targetUri = UserAgent.makeURI(
    target.includes("@") ? `sip:${target}` : `sip:${target}@${domain}`
  );

  if (!targetUri) {
    throw new Error(`Invalid SIP target: ${target}`);
  }

  const inviter = new Inviter(userAgent, targetUri);
  activeSession = inviter;
  wireSessionEvents(inviter, handlers);
  await inviter.invite();

  return inviter;
};

export const endSipCall = async () => {
  if (!activeSession) return;

  if (activeSession.state === SessionState.Initial) {
    await activeSession.cancel?.();
  } else if (activeSession.state === SessionState.Established) {
    await activeSession.bye?.();
  } else {
    await activeSession.dispose?.();
  }

  activeSession = null;
};

export const wireSessionEvents = (session, handlers = {}) => {
  session.stateChange.addListener((state) => {
    handlers?.onSessionState?.({ session, state });

    if (state === SessionState.Established) {
      activeSession = session;
      handlers?.onCallEstablished?.(session);
    }

    if (state === SessionState.Terminated) {
      if (activeSession === session) {
        activeSession = null;
      }
      handlers?.onCallTerminated?.(session);
    }
  });
};
