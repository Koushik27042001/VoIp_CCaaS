export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "",
  authToken: process.env.TWILIO_AUTH_TOKEN || "",
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  /** Public URL for Twilio webhooks (ngrok or production domain) */
  webhookBaseUrl: process.env.PUBLIC_API_URL || "http://localhost:5000",
};

export const isTwilioEnabled = () =>
  Boolean(
    twilioConfig.accountSid &&
      twilioConfig.authToken &&
      twilioConfig.phoneNumber
  );

export default twilioConfig;
