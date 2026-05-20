import twilio from "twilio";
import {
  twilioConfig,
  isTwilioClientEnabled,
  agentClientIdentity,
} from "../../config/twilio.js";
import { AppError } from "../../middlewares/error.middleware.js";

const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

export const createVoiceAccessToken = (agentId) => {
  if (!isTwilioClientEnabled()) {
    throw new AppError(
      "Twilio Voice Client is not configured. Set TWILIO_API_KEY_SID, TWILIO_API_SECRET, and TWILIO_TWIML_APP_SID.",
      503
    );
  }

  const identity = agentClientIdentity(agentId);
  const token = new AccessToken(
    twilioConfig.accountSid,
    twilioConfig.apiKeySid,
    twilioConfig.apiSecret,
    { identity, ttl: 3600 }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: twilioConfig.twimlAppSid,
    incomingAllow: true,
  });

  token.addGrant(voiceGrant);

  return {
    token: token.toJwt(),
    identity,
  };
};

export default { createVoiceAccessToken };
