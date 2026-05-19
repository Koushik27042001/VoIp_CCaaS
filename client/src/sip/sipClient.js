import {
  Invitation,
  Inviter,
  Registerer,
  SessionState,
  UserAgent,
} from "sip.js";
import { buildSipUri, getSipConfig } from "./sipConfig";

let userAgent = null;
let registerer = null;
let activeSession = null;

const emit = (handlers, eventName, payload) => {
  handlers?.[eventName]?.(payload);
};

export const getActiveSipSession = () => activeSession;

export const createSipClient = (handlers = {}) => {
  const config = getSipConfig();

  if (!config.enabled) {
    throw new Error("SIP is disabled. Set REACT_APP_SIP_ENABLED=true to enable SIP.js.");
  }

  const uri = UserAgent.makeURI(buildSipUri(config.extension, config.domain));
  if (!uri) {
    throw new Error("Invalid SIP URI");
  }

  userAgent = new UserAgent({
    uri,
    displayName: config.displayName,
    transportOptions: {
      server: config.wsServer,
    },
    authorizationUsername: config.extension,
    authorizationPassword: config.password,
    sessionDescriptionHandlerFactoryOptions: {
      peerConnectionConfiguration: {
        iceServers: [
          { urls: process.env.REACT_APP_STUN_URL || "stun:stun.l.google.com:19302" },
          ...(process.env.REACT_APP_TURN_URL
            ? [
                {
                  urls: process.env.REACT_APP_TURN_URL,
                  username: process.env.REACT_APP_TURN_USERNAME,
                  credential: process.env.REACT_APP_TURN_CREDENTIAL,
                },
              ]
            : []),
        ],
      },
    },
  });

  userAgent.delegate = {
    onInvite: (invitation) => {
      activeSession = invitation;
      wireSessionEvents(invitation, handlers);
      emit(handlers, "incomingCall", invitation);
    },
  };

  registerer = new Registerer(userAgent);

  return {
    config,
    userAgent,
    registerer,
  };
};

export const wireSessionEvents = (session, handlers = {}) => {
  session.stateChange.addListener((state) => {
    emit(handlers, "sessionState", { session, state });

    if (state === SessionState.Established) {
      activeSession = session;
      emit(handlers, "callEstablished", session);
    }

    if (state === SessionState.Terminated) {
      if (activeSession === session) {
        activeSession = null;
      }
      emit(handlers, "callTerminated", session);
    }
  });
};

export const registerSipAgent = async (handlers = {}) => {
  if (!userAgent || !registerer) {
    createSipClient(handlers);
  }

  await userAgent.start();
  await registerer.register();
  emit(handlers, "registered", getSipConfig());

  return {
    userAgent,
    registerer,
  };
};

export const unregisterSipAgent = async () => {
  if (registerer) {
    await registerer.unregister();
  }

  if (userAgent) {
    await userAgent.stop();
  }

  activeSession = null;
  registerer = null;
  userAgent = null;
};

export const makeSipCall = async (target, handlers = {}) => {
  const config = getSipConfig();

  if (!userAgent) {
    await registerSipAgent(handlers);
  }

  const targetUri = UserAgent.makeURI(
    target.includes("@") ? `sip:${target}` : buildSipUri(target, config.domain)
  );

  if (!targetUri) {
    throw new Error("Invalid SIP target");
  }

  const inviter = new Inviter(userAgent, targetUri);
  activeSession = inviter;
  wireSessionEvents(inviter, handlers);
  await inviter.invite();

  return inviter;
};

export const answerIncomingCall = async () => {
  if (!(activeSession instanceof Invitation)) {
    throw new Error("No incoming SIP call to answer");
  }

  await activeSession.accept();
  return activeSession;
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
