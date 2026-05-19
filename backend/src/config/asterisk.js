/**
 * Asterisk PBX configuration (AMI, ARI, WebSocket for SIP.js).
 * Copy values from your Asterisk deployment into .env.
 */
export const asteriskConfig = {
  ami: {
    host: process.env.ASTERISK_AMI_HOST || "127.0.0.1",
    port: Number(process.env.ASTERISK_AMI_PORT || 5038),
    username: process.env.ASTERISK_AMI_USER || "admin",
    password: process.env.ASTERISK_AMI_PASSWORD || "",
  },
  ari: {
    baseUrl: process.env.ASTERISK_ARI_URL || "http://127.0.0.1:8088/ari",
    username: process.env.ASTERISK_ARI_USER || "asterisk",
    password: process.env.ASTERISK_ARI_PASSWORD || "",
  },
  websocket: {
    /** WSS URL for browser SIP.js (e.g. ws://localhost:8088/ws) */
    publicUrl:
      process.env.ASTERISK_WS_PUBLIC_URL || "ws://127.0.0.1:8088/ws",
  },
  sip: {
    domain: process.env.ASTERISK_SIP_DOMAIN || "127.0.0.1",
    context: process.env.ASTERISK_OUTBOUND_CONTEXT || "outbound-mobile",
  },
};

export const isAsteriskEnabled = () =>
  Boolean(
    process.env.ASTERISK_AMI_PASSWORD &&
      process.env.ASTERISK_AMI_USER
  );

export default asteriskConfig;
