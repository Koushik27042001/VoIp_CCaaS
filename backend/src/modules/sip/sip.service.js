import * as sipExtensionRepo from "../../repositories/sipExtension.repository.js";
import { buildRegistrationConfig } from "../../adapters/sip.adapter.js";
import * as asteriskAdapter from "../../adapters/asterisk.adapter.js";
import { asteriskConfig } from "../../config/asterisk.js";
import { getTelecomStatus } from "../../services/outboundCall.service.js";
import {
  emitSipRegistered,
  emitSipUnregistered,
  emitSipFailed,
} from "../../events/sip.events.js";
import { AppError } from "../../middlewares/error.middleware.js";

export const getRegistrationConfigForUser = async (userId) => {
  const extension = await sipExtensionRepo.findByUserId(userId);

  if (!extension) {
    return null;
  }

  return buildRegistrationConfig({
    extension: extension.extension,
    password: extension.password,
    displayName: extension.displayName,
  });
};

export const reportRegistration = async ({
  extension,
  status,
  contactUri,
}) => {
  const record = await sipExtensionRepo.findByExtension(extension);

  if (!record) {
    throw new AppError("Unknown SIP extension", 404);
  }

  const mappedStatus =
    status === "registered" ? "registered" : status === "failed" ? "failed" : "unregistered";

  await sipExtensionRepo.updateStatus(extension, mappedStatus, {
    lastRegisteredAt: mappedStatus === "registered" ? new Date() : record.lastRegisteredAt,
    contactUri: contactUri || record.contactUri,
  });

  const payload = { extension, userId: record.userId, contactUri };

  if (mappedStatus === "registered") {
    emitSipRegistered(payload);
  } else if (mappedStatus === "failed") {
    emitSipFailed({ ...payload, reason: "registration_failed" });
  } else {
    emitSipUnregistered(payload);
  }

  return { extension, status: mappedStatus };
};

export const getSipHealth = async () => {
  const telecom = getTelecomStatus();
  const asteriskPing = telecom.asterisk
    ? await asteriskAdapter.ping()
    : { ok: false, skipped: true };

  return {
    telecom,
    asterisk: {
      ...asteriskPing,
      wsUrl: asteriskConfig.websocket.publicUrl,
      domain: asteriskConfig.sip.domain,
    },
  };
};

export const listExtensions = () => sipExtensionRepo.listExtensions();
