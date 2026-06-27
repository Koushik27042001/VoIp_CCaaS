const normalizePhone = (value = "") => value.replace(/\s+/g, "").trim();
const normalizeText = (value = "") => String(value || "").trim();

export const twilioConfig = {
  accountSid: normalizeText(process.env.TWILIO_ACCOUNT_SID),
  authToken: normalizeText(process.env.TWILIO_AUTH_TOKEN),
  phoneNumber: normalizePhone(process.env.TWILIO_PHONE_NUMBER || ""),
  apiKeySid: normalizeText(process.env.TWILIO_API_KEY_SID),
  apiSecret: normalizeText(process.env.TWILIO_API_SECRET),
  twimlAppSid: normalizeText(process.env.TWILIO_TWIML_APP_SID),
  /** Public URL for Twilio webhooks (ngrok or production domain) */
  webhookBaseUrl: normalizeText(process.env.PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/$/,
    ""
  ),
};

const isTwilioForcedOff = () => process.env.TWILIO_ENABLED === "false";

export const isTwilioEnabled = () =>
  Boolean(
    !isTwilioForcedOff() &&
      twilioConfig.accountSid &&
      twilioConfig.authToken &&
      twilioConfig.phoneNumber
  );

export const isTwilioClientEnabled = () =>
  Boolean(
    isTwilioEnabled() &&
      twilioConfig.apiKeySid &&
      twilioConfig.apiSecret &&
      twilioConfig.twimlAppSid
  );

export const isTwilioClientCallingEnabled = () =>
  process.env.TWILIO_CLIENT_CALLING_ENABLED === "true";

export const agentClientIdentity = (agentId) => `agent_${agentId}`;

export default twilioConfig;
