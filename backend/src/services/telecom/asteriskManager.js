import { execFile } from "node:child_process";
import logger from "../../utils/logger.js";

const DEFAULT_TIMEOUT_MS = 15000;

const allowedCommands = new Set([
  "core show version",
  "pjsip show endpoints",
  "pjsip show registrations",
  "pjsip show contacts",
  "pjsip show aors",
  "queue show",
  "rtp show settings",
]);

export const isAsteriskCommandEnabled = () =>
  process.env.ASTERISK_CLI_ENABLED === "true";

export const runAsteriskCommand = (command) => {
  if (!allowedCommands.has(command)) {
    return Promise.reject(new Error(`Asterisk command is not allowed: ${command}`));
  }

  if (!isAsteriskCommandEnabled()) {
    return Promise.resolve({
      status: "skipped",
      command,
      stdout: "",
      stderr: "",
      message: "Asterisk CLI skipped. Set ASTERISK_CLI_ENABLED=true to enable.",
    });
  }

  return new Promise((resolve) => {
    execFile(
      "asterisk",
      ["-rx", command],
      { timeout: Number(process.env.ASTERISK_CLI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS) },
      (error, stdout, stderr) => {
        if (error) {
          logger.warn({ err: error, command }, "Asterisk CLI command failed");
          resolve({
            status: "failed",
            command,
            stdout,
            stderr: stderr || error.message,
            message: stderr || error.message,
          });
          return;
        }

        resolve({
          status: "success",
          command,
          stdout,
          stderr,
          message: stdout || `${command} completed`,
        });
      }
    );
  });
};

export const getAsteriskSnapshot = async () => {
  const [version, endpoints, registrations, contacts, rtp] = await Promise.all([
    runAsteriskCommand("core show version"),
    runAsteriskCommand("pjsip show endpoints"),
    runAsteriskCommand("pjsip show registrations"),
    runAsteriskCommand("pjsip show contacts"),
    runAsteriskCommand("rtp show settings"),
  ]);

  return {
    cliEnabled: isAsteriskCommandEnabled(),
    version,
    endpoints,
    registrations,
    contacts,
    rtp,
  };
};

export default {
  getAsteriskSnapshot,
  isAsteriskCommandEnabled,
  runAsteriskCommand,
};
