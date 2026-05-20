import { AppError } from "../middlewares/error.middleware.js";
import * as twilioAdapter from "../adapters/twilio.adapter.js";
import * as asteriskAdapter from "../adapters/asterisk.adapter.js";
import * as sipExtensionRepo from "../repositories/sipExtension.repository.js";
import { isTwilioClientEnabled } from "../config/twilio.js";
import logger from "../telemetry/logger.js";

const normalizePhone = (phone) => phone.replace(/[\s-]/g, "").trim();

/**
 * Dial a real PSTN/mobile number.
 * Prefers Asterisk when AMI is configured, otherwise Twilio.
 * When Twilio Voice Client is configured, browser SDK handles media (mode: client).
 */
export const dialOutbound = async ({ phone, agentId, callId, mode = "auto" }) => {
  const destination = normalizePhone(phone);

  if (mode === "client" && isTwilioClientEnabled()) {
    return {
      provider: "twilio",
      mode: "client",
      externalId: null,
    };
  }

  if (asteriskAdapter.isAvailable()) {
    const extension = await sipExtensionRepo.findByUserId(agentId);

    if (!extension) {
      throw new AppError(
        "No SIP extension assigned to this agent. Provision extension in MongoDB.",
        400
      );
    }

    return asteriskAdapter.originateOutbound({
      agentExtension: extension.extension,
      destination,
      callId,
    });
  }

  if (twilioAdapter.isAvailable()) {
    return twilioAdapter.dialPstn({ to: destination, callId, agentId });
  }

  logger.error("No telecom provider configured");
  throw new AppError(
    "Telecom not configured. Set Asterisk AMI or Twilio credentials in .env",
    503
  );
};

export const hangupOutbound = async ({ externalId, provider }) => {
  if (provider === "twilio" && externalId) {
    return twilioAdapter.cancelCall(externalId);
  }
  return null;
};

export const getTelecomStatus = () => ({
  asterisk: asteriskAdapter.isAvailable(),
  twilio: twilioAdapter.isAvailable(),
  twilioClient: isTwilioClientEnabled(),
});

export default { dialOutbound, hangupOutbound, getTelecomStatus };
