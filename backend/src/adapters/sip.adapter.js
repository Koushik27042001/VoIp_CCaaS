import { asteriskConfig } from "../config/asterisk.js";

/**
 * Build SIP.js registration config for a browser agent.
 * Password comes from SipExtension record (provisioned per user).
 */
export const buildRegistrationConfig = ({ extension, password, displayName }) => {
  const domain = asteriskConfig.sip.domain;

  return {
    extension,
    password,
    displayName: displayName || extension,
    domain,
    wsServer: asteriskConfig.websocket.publicUrl,
    uri: `sip:${extension}@${domain}`,
    outboundProxy: asteriskConfig.websocket.publicUrl,
  };
};

export default { buildRegistrationConfig };
