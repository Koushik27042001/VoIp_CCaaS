export const getSipConfig = () => ({
  enabled: process.env.REACT_APP_SIP_ENABLED === "true",
  wsServer: process.env.REACT_APP_SIP_WS_SERVER || "wss://localhost:8089/ws",
  domain: process.env.REACT_APP_SIP_DOMAIN || "localhost",
  extension: process.env.REACT_APP_SIP_EXTENSION || "1001",
  password: process.env.REACT_APP_SIP_PASSWORD || "agent1001",
  displayName: process.env.REACT_APP_SIP_DISPLAY_NAME || "Agent 1001",
});

export const buildSipUri = (extension, domain) => `sip:${extension}@${domain}`;
