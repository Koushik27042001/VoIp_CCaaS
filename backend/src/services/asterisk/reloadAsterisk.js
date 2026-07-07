import { execFile } from "node:child_process";

const reloadCommands = {
  SIP: "sip reload",
  PJSIP: "pjsip reload",
  DIALPLAN: "dialplan reload",
};

export default function reloadAsterisk(protocol = "PJSIP") {
  if (process.env.ASTERISK_RELOAD_ENABLED !== "true") {
    return Promise.resolve({
      status: "skipped",
      message: "Asterisk reload skipped. Set ASTERISK_RELOAD_ENABLED=true to enable.",
    });
  }

  if (Array.isArray(protocol)) {
    return Promise.all(protocol.map((p) => reloadAsterisk(p)));
  }

  const command = reloadCommands[protocol] || reloadCommands.PJSIP;
  const dockerContainer = process.env.ASTERISK_DOCKER_CONTAINER || "voip-asterisk";
  const useDockerReload = process.env.ASTERISK_RELOAD_VIA_DOCKER !== "false";

  return new Promise((resolve) => {
    const runHostCommand = () =>
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

    if (useDockerReload) {
      execFile(
        "docker",
        ["exec", dockerContainer, "asterisk", "-rx", command],
        { timeout: 15000 },
        (error, stdout, stderr) => {
          if (!error) {
            resolve({
              status: "success",
              message: stdout || `${command} completed via Docker`,
            });
            return;
          }

          // Fallback to host asterisk binary if Docker exec fails.
          runHostCommand();
        }
      );
      return;
    }

    runHostCommand();
  });
}
