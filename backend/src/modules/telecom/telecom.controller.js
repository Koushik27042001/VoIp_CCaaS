import { getAsteriskSnapshot } from "../../services/telecom/asteriskManager.js";
import { buildSipRuntimeConfig } from "../../services/telecom/sipRouting.js";
import getTrunkHealth from "../../services/telecom/trunkHealth.js";
import generateRuntimeConfig from "../../services/asterisk/generateRuntimeConfig.js";

export const getTelecomStatus = async (_req, res, next) => {
  try {
    const [asterisk, trunkHealth] = await Promise.all([
      getAsteriskSnapshot(),
      getTrunkHealth(),
    ]);

    res.json({
      status: "ok",
      mode: process.env.USE_MOCK === "true" ? "mock" : "production",
      asterisk,
      trunkHealth,
    });
  } catch (error) {
    next(error);
  }
};

export const getSipRuntimePlan = (_req, res) => {
  const config = buildSipRuntimeConfig();
  res.json({
    agents: config.agents.map(({ password, ...agent }) => agent),
    pjsipPreview: config.pjsip,
    extensionsPreview: config.extensions,
    rtpPreview: config.rtp,
  });
};

export const regenerateRuntimeConfig = async (_req, res, next) => {
  try {
    res.json(await generateRuntimeConfig());
  } catch (error) {
    next(error);
  }
};

export const getTrunksHealth = async (_req, res, next) => {
  try {
    res.json(await getTrunkHealth());
  } catch (error) {
    next(error);
  }
};
