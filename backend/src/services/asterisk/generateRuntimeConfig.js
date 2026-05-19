import fs from "node:fs/promises";
import path from "node:path";
import { buildSipRuntimeConfig } from "../telecom/sipRouting.js";

const defaultAsteriskDir =
  process.env.NODE_ENV === "production"
    ? "/etc/asterisk"
    : path.resolve(process.cwd(), "generated", "asterisk");

const writeAtomic = async (filePath, content) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await fs.writeFile(tempPath, content, { mode: 0o600 });
  await fs.rename(tempPath, filePath);
};

export const generateRuntimeConfig = async () => {
  const configDir = process.env.ASTERISK_CONFIG_DIR || defaultAsteriskDir;
  const config = buildSipRuntimeConfig();
  const files = [
    {
      type: "pjsip",
      filePath: process.env.ASTERISK_WEBRTC_PJSIP_PATH || path.join(configDir, "pjsip_webrtc.conf"),
      content: config.pjsip,
    },
    {
      type: "extensions",
      filePath:
        process.env.ASTERISK_EXTENSIONS_CONFIG_PATH ||
        path.join(configDir, "extensions_ccaas.conf"),
      content: config.extensions,
    },
    {
      type: "rtp",
      filePath: process.env.ASTERISK_RTP_CONFIG_PATH || path.join(configDir, "rtp_ccaas.conf"),
      content: config.rtp,
    },
  ];

  for (const file of files) {
    await writeAtomic(file.filePath, file.content);
  }

  return {
    generatedAt: new Date().toISOString(),
    agents: config.agents.map(({ password, ...agent }) => agent),
    files: files.map(({ content, ...file }) => file),
  };
};

export default generateRuntimeConfig;
