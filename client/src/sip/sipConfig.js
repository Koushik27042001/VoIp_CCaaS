export const getSipConfig = () => ({
  enabled: process.env.REACT_APP_SIP_ENABLED === "true",
  wsServer: process.env.REACT_APP_SIP_WS_SERVER || "wss://localhost:8089/ws",
  domain: process.env.REACT_APP_SIP_DOMAIN || "localhost",
  extension: process.env.REACT_APP_SIP_EXTENSION || "",
  password: process.env.REACT_APP_SIP_PASSWORD || "",
  displayName: process.env.REACT_APP_SIP_DISPLAY_NAME || "",
});

export const buildSipUri = (extension, domain) => `sip:${extension}@${domain}`;
