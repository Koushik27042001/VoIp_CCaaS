const DEFAULT_CONTEXT = "from-internal";

const clean = (value = "") => String(value).replace(/[\r\n]/g, "").trim();

export const buildAgentExtensions = ({
  start = Number(process.env.AGENT_EXTENSION_START || 1001),
  count = Number(process.env.AGENT_EXTENSION_COUNT || 20),
  passwordPrefix = process.env.AGENT_EXTENSION_PASSWORD_PREFIX || "agent",
} = {}) => {
  return Array.from({ length: count }, (_, index) => {
    const extension = String(start + index);

    return {
      extension,
      displayName: `Agent ${extension}`,
      username: extension,
      password: `${passwordPrefix}${extension}`,
      context: DEFAULT_CONTEXT,
      transport: "transport-wss",
      webrtc: true,
    };
  });
};

export const renderPjsipTransports = () => [
  "[transport-udp]",
  "type=transport",
  "protocol=udp",
  "bind=0.0.0.0:5060",
  "",
  "[transport-wss]",
  "type=transport",
  "protocol=wss",
  `bind=0.0.0.0:${Number(process.env.ASTERISK_WSS_PORT || 8089)}`,
  "",
].join("\n");

export const renderWebRtcEndpoint = (agent) => {
  const id = clean(agent.extension);
  const password = clean(agent.password);

  return [
    `[${id}-auth]`,
    "type=auth",
    "auth_type=userpass",
    `username=${id}`,
    `password=${password}`,
    "",
    `[${id}-aor]`,
    "type=aor",
    "max_contacts=1",
    "remove_existing=yes",
    "qualify_frequency=30",
    "",
    `[${id}]`,
    "type=endpoint",
    "transport=transport-wss",
    `context=${clean(agent.context || DEFAULT_CONTEXT)}`,
    "disallow=all",
    "allow=opus,ulaw,alaw",
    `auth=${id}-auth`,
    `aors=${id}-aor`,
    "webrtc=yes",
    "use_avpf=yes",
    "media_encryption=dtls",
    "dtls_auto_generate_cert=yes",
    "ice_support=yes",
    "rtcp_mux=yes",
    "direct_media=no",
    "force_rport=yes",
    "rewrite_contact=yes",
    "rtp_symmetric=yes",
    "",
  ].join("\n");
};

export const renderInternalDialplan = () => [
  "[from-internal]",
  "exten => _1XXX,1,NoOp(Internal browser SIP call to ${EXTEN})",
  " same => n,Dial(PJSIP/${EXTEN},30)",
  " same => n,Hangup()",
  "",
  "exten => _9X.,1,NoOp(Outbound PSTN call through configured trunk)",
  " same => n,Dial(PJSIP/${EXTEN:1}@${OUTBOUND_TRUNK},60)",
  " same => n,Hangup()",
  "",
  "[from-trunk]",
  "exten => _X.,1,NoOp(Inbound trunk call for ${EXTEN})",
  " same => n,Dial(PJSIP/1001,30)",
  " same => n,Hangup()",
  "",
].join("\n");

export const buildSipRuntimeConfig = () => {
  const agents = buildAgentExtensions();

  return {
    agents,
    pjsip: [
      "; Managed by VoIP CCaaS. Include this from pjsip.conf.",
      renderPjsipTransports(),
      ...agents.map(renderWebRtcEndpoint),
    ].join("\n"),
    extensions: [
      "; Managed by VoIP CCaaS. Include this from extensions.conf.",
      renderInternalDialplan(),
    ].join("\n"),
    rtp: [
      "; Managed by VoIP CCaaS. Include or copy to rtp.conf.",
      "[general]",
      `rtpstart=${Number(process.env.ASTERISK_RTP_START || 10000)}`,
      `rtpend=${Number(process.env.ASTERISK_RTP_END || 20000)}`,
      "icesupport=yes",
      "stunaddr=stun.l.google.com:19302",
      "",
    ].join("\n"),
  };
};

export default {
  buildAgentExtensions,
  buildSipRuntimeConfig,
  renderInternalDialplan,
  renderPjsipTransports,
  renderWebRtcEndpoint,
};
