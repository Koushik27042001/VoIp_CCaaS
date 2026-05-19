import ami from "asterisk-manager";
import { asteriskConfig, isAsteriskEnabled } from "../config/asterisk.js";
import logger from "../telemetry/logger.js";

let manager = null;
let connecting = null;

const connect = () => {
  if (!isAsteriskEnabled()) {
    return Promise.resolve(null);
  }

  if (manager) {
    return Promise.resolve(manager);
  }

  if (connecting) {
    return connecting;
  }

  const { host, port, username, password } = asteriskConfig.ami;

  connecting = new Promise((resolve, reject) => {
    const instance = ami(
      port,
      host,
      username,
      password,
      true
    );

    instance.on("connect", () => {
      manager = instance;
      logger.info({ host, port }, "Asterisk AMI connected");
      resolve(manager);
    });

    instance.on("error", (err) => {
      logger.error({ err, host, port }, "Asterisk AMI error");
      if (!manager) {
        reject(err);
      }
    });

    instance.on("close", () => {
      logger.warn("Asterisk AMI connection closed");
      manager = null;
      connecting = null;
    });
  });

  return connecting;
};

/**
 * Originate: ring agent extension first, then dial PSTN via dialplan context.
 */
export const originateOutbound = async ({
  agentExtension,
  destination,
  callId,
}) => {
  const amiClient = await connect();
  if (!amiClient) {
    throw new Error("Asterisk AMI is not configured");
  }

  const channel = `PJSIP/${agentExtension}`;
  const context = asteriskConfig.sip.context;
  const dest = destination.replace(/\D/g, "");

  return new Promise((resolve, reject) => {
    amiClient.action(
      {
        action: "Originate",
        Channel: channel,
        Context: context,
        Exten: dest,
        Priority: 1,
        CallerID: agentExtension,
        Async: true,
        Variable: `CALL_ID=${callId}`,
      },
      (err, res) => {
        if (err) {
          logger.error({ err, agentExtension, dest }, "AMI originate failed");
          return reject(err);
        }
        logger.info(
          { agentExtension, dest, callId, response: res?.response },
          "AMI originate queued"
        );
        resolve({
          provider: "asterisk",
          externalId: res?.actionid,
          status: res?.response || "queued",
        });
      }
    );
  });
};

export const ping = async () => {
  try {
    await connect();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const isAvailable = () => isAsteriskEnabled();

export default {
  connect,
  originateOutbound,
  ping,
  isAvailable,
};
