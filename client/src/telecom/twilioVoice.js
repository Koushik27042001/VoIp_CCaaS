import { Device } from "@twilio/voice-sdk";

let device = null;
let activeConnection = null;
let statusHandler = null;

export const getTwilioDevice = () => device;
export const getActiveTwilioConnection = () => activeConnection;

export const initTwilioDevice = async (token, { onStatusChange } = {}) => {
  statusHandler = onStatusChange;

  if (device) {
    device.destroy();
    device = null;
  }

  device = new Device(token, {
    logLevel: "error",
    codecPreferences: ["opus", "pcmu"],
  });

  device.on("registered", () => onStatusChange?.("registered"));
  device.on("unregistered", () => onStatusChange?.("unregistered"));
  device.on("error", (error) => onStatusChange?.("failed", error));

  device.on("incoming", (connection) => {
    activeConnection = connection;
    wireConnectionEvents(connection);
    onStatusChange?.("incoming");
  });

  await device.register();
  return device;
};

const wireConnectionEvents = (connection) => {
  connection.on("accept", () => statusHandler?.("connected"));
  connection.on("disconnect", () => {
    if (activeConnection === connection) {
      activeConnection = null;
    }
    statusHandler?.("idle");
  });
  connection.on("cancel", () => {
    if (activeConnection === connection) {
      activeConnection = null;
    }
    statusHandler?.("idle");
  });
  connection.on("error", (error) => statusHandler?.("call_error", error));
};

export const connectTwilioOutbound = async ({ to, callId }) => {
  if (!device) {
    throw new Error("Twilio voice device is not ready");
  }

  activeConnection = await device.connect({
    params: {
      To: to,
      callId,
    },
  });

  wireConnectionEvents(activeConnection);
  return activeConnection;
};

export const disconnectTwilioCall = () => {
  if (activeConnection) {
    activeConnection.disconnect();
    activeConnection = null;
  }

  device?.disconnectAll();
};

export const destroyTwilioDevice = () => {
  disconnectTwilioCall();
  if (device) {
    device.destroy();
    device = null;
  }
};
