import { AppError } from "../middlewares/error.middleware.js";
import * as twilioAdapter from "../adapters/twilio.adapter.js";
import * as asteriskAdapter from "../adapters/asterisk.adapter.js";
import * as sipExtensionRepo from "../repositories/sipExtension.repository.js";
import logger from "../telemetry/logger.js";

const normalizePhone = (phone) => phone.replace(/[\s-]/g, "").trim();

/**
 * Dial a real PSTN/mobile number.
 * Prefers Asterisk (agent SIP extension + trunk) when AMI is configured,
 * otherwise falls back to Twilio PSTN.
 */
export const dialOutbound = async ({ phone, agentId, callId }) => {
  const destination = normalizePhone(phone);

  if (asteriskAdapter.isAvailable()) {
    const extension = await sipExtensionRepo.findByUserId(agentId);

    if (!extension) {
      throw new AppError(
        "No SIP extension assigned to this agent. Provision extension in MongoDB.",
        400
      );
    }

    const result = await asteriskAdapter.originateOutbound({
      agentExtension: extension.extension,
      destination,
      callId,
    });

    return result;
  }

  if (twilioAdapter.isAvailable()) {
    return twilioAdapter.dialPstn({ to: destination, callId });
  }

  logger.error("No telecom provider configured");
  throw new AppError(
    "Telecom not configured. Set Asterisk AMI or Twilio credentials in .env",
    503
  );
};

export const getTelecomStatus = () => ({
  asterisk: asteriskAdapter.isAvailable(),
  twilio: twilioAdapter.isAvailable(),
});

export default { dialOutbound, getTelecomStatus };
