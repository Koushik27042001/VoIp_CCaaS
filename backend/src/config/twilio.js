const normalizePhone = (value = "") => value.replace(/\s+/g, "").trim();

export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "",
  authToken: process.env.TWILIO_AUTH_TOKEN || "",
  phoneNumber: normalizePhone(process.env.TWILIO_PHONE_NUMBER || ""),
  apiKeySid: process.env.TWILIO_API_KEY_SID || "",
  apiSecret: process.env.TWILIO_API_SECRET || "",
  twimlAppSid: process.env.TWILIO_TWIML_APP_SID || "",
  /** Public URL for Twilio webhooks (ngrok or production domain) */
  webhookBaseUrl: (process.env.PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, ""),
};

export const isTwilioEnabled = () =>
  Boolean(
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

export const agentClientIdentity = (agentId) => `agent_${agentId}`;

export default twilioConfig;
