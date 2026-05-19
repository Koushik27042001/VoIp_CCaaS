import { execFile } from "child_process";

const reloadCommands = {
  SIP: "sip reload",
  PJSIP: "pjsip reload",
};

export default function reloadAsterisk(protocol = "PJSIP") {
  if (process.env.ASTERISK_RELOAD_ENABLED !== "true") {
    return Promise.resolve({
      status: "skipped",
      message: "Asterisk reload skipped. Set ASTERISK_RELOAD_ENABLED=true to enable.",
    });
  }

  const command = reloadCommands[protocol] || reloadCommands.PJSIP;

  return new Promise((resolve) => {
    execFile("asterisk", ["-rx", command], { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({
          status: "failed",
          message: stderr || error.message,
        });
        return;
      }

      resolve({
        status: "success",
        message: stdout || `${command} completed`,
      });
    });
  });
}
