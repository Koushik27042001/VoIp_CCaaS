import fs from "fs/promises";
import os from "os";
import path from "path";
import SipTrunk from "../../modules/sipTrunks/sipTrunk.model.js";
import reloadAsterisk from "./reloadAsterisk.js";

const defaultAsteriskDir =
  process.env.NODE_ENV === "production"
    ? "/etc/asterisk"
    : path.resolve(process.cwd(), "generated", "asterisk");

function cleanValue(value = "") {
  return String(value).replace(/[\r\n]/g, "").trim();
}

function getPassword(trunk) {
  return trunk.getDecryptedPassword ? trunk.getDecryptedPassword() : trunk.password;
}

function getConfigPath(protocol) {
  const configDir = process.env.ASTERISK_CONFIG_DIR || defaultAsteriskDir;

  if (protocol === "SIP") {
    return process.env.ASTERISK_SIP_CONFIG_PATH || path.join(configDir, "sip_custom.conf");
  }

  return process.env.ASTERISK_PJSIP_CONFIG_PATH || path.join(configDir, "pjsip_custom.conf");
}

function buildRegistrationString(trunk) {
  if (!trunk.registrationEnabled) return "";

  const user = cleanValue(trunk.username);
  const password = cleanValue(getPassword(trunk));
  const host = cleanValue(trunk.host);
  const port = Number(trunk.port) || 5060;
  const fromUser = cleanValue(trunk.fromUser || trunk.username);

  return `${user}:${password}@${host}:${port}/${fromUser}`;
}

function renderSipTrunk(trunk) {
  const id = cleanValue(trunk.carrierId);
  const codecs = trunk.codecs?.length ? trunk.codecs.map(cleanValue) : ["ulaw", "alaw"];
  const register = buildRegistrationString(trunk);

  return [
    `; ${cleanValue(trunk.carrierName)}`,
    register ? `register => ${register}` : null,
    `[${id}]`,
    "type=friend",
    `host=${cleanValue(trunk.host)}`,
    `port=${Number(trunk.port) || 5060}`,
    `username=${cleanValue(trunk.username)}`,
    `secret=${cleanValue(getPassword(trunk))}`,
    `fromuser=${cleanValue(trunk.fromUser || trunk.username)}`,
    trunk.fromDomain ? `fromdomain=${cleanValue(trunk.fromDomain)}` : null,
    `context=${cleanValue(trunk.context || "from-trunk")}`,
    "disallow=all",
    ...codecs.map((codec) => `allow=${codec}`),
    "insecure=port,invite",
    "qualify=yes",
    "nat=force_rport,comedia",
    "canreinvite=no",
    `transport=${cleanValue(trunk.transport || "udp")}`,
  ]
    .filter(Boolean)
    .join(os.EOL);
}

function renderPjsipTrunk(trunk) {
  const id = cleanValue(trunk.carrierId);
  const host = cleanValue(trunk.host);
  const port = Number(trunk.port) || 5060;
  const username = cleanValue(trunk.username);
  const fromUser = cleanValue(trunk.fromUser || trunk.username);
  const codecs = trunk.codecs?.length ? trunk.codecs.map(cleanValue).join(",") : "ulaw,alaw";

  return [
    `; ${cleanValue(trunk.carrierName)}`,
    `[${id}-auth]`,
    "type=auth",
    "auth_type=userpass",
    `username=${username}`,
    `password=${cleanValue(getPassword(trunk))}`,
    "",
    `[${id}-aor]`,
    "type=aor",
    `contact=sip:${host}:${port}`,
    "qualify_frequency=60",
    "",
    `[${id}]`,
    "type=endpoint",
    `transport=transport-${cleanValue(trunk.transport || "udp")}`,
    `context=${cleanValue(trunk.context || "from-trunk")}`,
    "disallow=all",
    `allow=${codecs}`,
    `outbound_auth=${id}-auth`,
    `aors=${id}-aor`,
    `from_user=${fromUser}`,
    trunk.fromDomain ? `from_domain=${cleanValue(trunk.fromDomain)}` : null,
    "direct_media=no",
    "force_rport=yes",
    "rewrite_contact=yes",
    "rtp_symmetric=yes",
    "",
    `[${id}-identify]`,
    "type=identify",
    `endpoint=${id}`,
    `match=${host}`,
    trunk.registrationEnabled ? "" : null,
    trunk.registrationEnabled ? `[${id}-registration]` : null,
    trunk.registrationEnabled ? "type=registration" : null,
    trunk.registrationEnabled ? `transport=transport-${cleanValue(trunk.transport || "udp")}` : null,
    trunk.registrationEnabled ? `outbound_auth=${id}-auth` : null,
    trunk.registrationEnabled ? `server_uri=sip:${host}:${port}` : null,
    trunk.registrationEnabled ? `client_uri=sip:${username}@${host}:${port}` : null,
    trunk.registrationEnabled ? `contact_user=${fromUser}` : null,
    trunk.registrationEnabled ? "retry_interval=60" : null,
    trunk.registrationEnabled ? "expiration=3600" : null,
  ]
    .filter((line) => line !== null)
    .join(os.EOL);
}

async function writeAtomic(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, content, { mode: 0o600 });
  await fs.rename(tempPath, filePath);
}

export async function generateAllSipConfigs() {
  const trunks = await SipTrunk.find({ enabled: true }).select("+password").sort({ carrierId: 1 });
  return generateSipConfigsForTrunks(trunks);
}

export async function generateSipConfigsForTrunks(trunks = []) {
  const enabledTrunks = trunks.filter((trunk) => trunk.enabled !== false);
  const byProtocol = {
    SIP: enabledTrunks.filter((trunk) => trunk.protocol === "SIP"),
    PJSIP: enabledTrunks.filter((trunk) => trunk.protocol === "PJSIP"),
  };

  const results = [];

  for (const protocol of ["SIP", "PJSIP"]) {
    const renderer = protocol === "SIP" ? renderSipTrunk : renderPjsipTrunk;
    const body = byProtocol[protocol].map(renderer).join(`${os.EOL}${os.EOL}`);
    const content = [
      "; Managed by VoIP CCaaS. Do not edit this file manually.",
      `; Generated at ${new Date().toISOString()}`,
      "",
      body,
      "",
    ].join(os.EOL);

    const filePath = getConfigPath(protocol);
    await writeAtomic(filePath, content);
    const reload = await reloadAsterisk(protocol);

    results.push({
      protocol,
      filePath,
      trunkCount: byProtocol[protocol].length,
      reload,
    });
  }

  const now = new Date();
  if (enabledTrunks.some((trunk) => trunk.$__ || trunk.constructor?.modelName === "SipTrunk")) {
    await SipTrunk.updateMany(
      { enabled: true },
      {
        lastConfigGeneratedAt: now,
        lastReloadAt: now,
        lastReloadStatus: results.some((result) => result.reload.status === "failed")
          ? "failed"
          : results.some((result) => result.reload.status === "success")
            ? "success"
            : "skipped",
        lastReloadMessage: results.map((result) => `${result.protocol}: ${result.reload.message}`).join(" | "),
      },
    );
  }

  return results;
}

export default generateAllSipConfigs;
