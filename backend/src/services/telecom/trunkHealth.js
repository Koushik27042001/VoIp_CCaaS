import SipTrunk from "../../modules/sipTrunks/sipTrunk.model.js";
import mockSipTrunks from "../../data/mockSipTrunks.js";
import { isMockMode } from "../../config/env.js";
import { runAsteriskCommand } from "./asteriskManager.js";

const summarizeRegistration = (trunk, cliOutput = "") => {
  const carrierId = trunk.carrierId;
  const matchedLine = cliOutput
    .split("\n")
    .find((line) => line.toLowerCase().includes(String(carrierId).toLowerCase()));

  return {
    id: trunk._id,
    carrierId,
    carrierName: trunk.carrierName,
    enabled: trunk.enabled,
    registrationEnabled: trunk.registrationEnabled,
    lastReloadStatus: trunk.lastReloadStatus || "pending",
    registered: matchedLine ? /registered|reachable|available/i.test(matchedLine) : null,
    rawStatus: matchedLine?.trim() || "No Asterisk registration line found",
  };
};

export const getTrunkHealth = async () => {
  const trunks = isMockMode()
    ? mockSipTrunks
    : await SipTrunk.find().select("-password").sort({ carrierId: 1 }).lean();

  const registrationResult = await runAsteriskCommand("pjsip show registrations");
  const output = registrationResult.stdout || registrationResult.message || "";

  return {
    checkedAt: new Date().toISOString(),
    asterisk: {
      cliStatus: registrationResult.status,
      cliEnabled: process.env.ASTERISK_CLI_ENABLED === "true",
      message: registrationResult.message,
    },
    trunks: trunks.map((trunk) => summarizeRegistration(trunk, output)),
  };
};

export default getTrunkHealth;
