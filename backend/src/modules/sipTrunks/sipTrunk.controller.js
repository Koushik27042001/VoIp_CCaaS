import SipTrunk from "./sipTrunk.model.js";
import generateAllSipConfigs, { generateSipConfigsForTrunks } from "../../services/asterisk/generateSipConfig.js";
import mockSipTrunks from "../../data/mockSipTrunks.js";
import { isMockMode } from "../../config/env.js";

const publicFields = "-password";

function sanitizeTrunk(trunk) {
  const { password, ...safeTrunk } = trunk.toJSON ? trunk.toJSON() : trunk;
  return safeTrunk;
}

function updateMockConfigMetadata(configResults) {
  const now = new Date();
  const lastReloadStatus = configResults.some((result) => result.reload.status === "failed")
    ? "failed"
    : configResults.some((result) => result.reload.status === "success")
      ? "success"
      : "skipped";
  const lastReloadMessage = configResults
    .map((result) => `${result.protocol}: ${result.reload.message}`)
    .join(" | ");

  mockSipTrunks.forEach((trunk) => {
    if (!trunk.enabled) return;
    trunk.lastConfigGeneratedAt = now;
    trunk.lastReloadAt = now;
    trunk.lastReloadStatus = lastReloadStatus;
    trunk.lastReloadMessage = lastReloadMessage;
  });
}

async function regenerateMockConfigs() {
  const configResults = await generateSipConfigsForTrunks(mockSipTrunks);
  updateMockConfigMetadata(configResults);
  return configResults;
}

function normalizeBody(body) {
  const payload = { ...body };

  if (payload.carrierId) payload.carrierId = String(payload.carrierId).trim().toLowerCase();
  if (payload.port !== undefined) payload.port = Number(payload.port);
  if (typeof payload.codecs === "string") {
    payload.codecs = payload.codecs
      .split(",")
      .map((codec) => codec.trim())
      .filter(Boolean);
  }

  return payload;
}

async function regenerateConfigs(res, trunk, status = 200) {
  const configResults = await generateAllSipConfigs();
  const safeTrunk = await SipTrunk.findById(trunk._id).select(publicFields);

  return res.status(status).json({
    trunk: safeTrunk,
    config: configResults,
  });
}

export const createSipTrunk = async (req, res) => {
  try {
    if (isMockMode()) {
      const payload = normalizeBody(req.body);
      if (mockSipTrunks.some((trunk) => trunk.carrierId === payload.carrierId)) {
        return res.status(409).json({ error: "Carrier ID already exists" });
      }

      const now = new Date();
      const trunk = {
        _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        protocol: "PJSIP",
        transport: "udp",
        codecs: ["ulaw", "alaw"],
        context: "from-trunk",
        enabled: true,
        registrationEnabled: true,
        lastReloadStatus: "pending",
        ...payload,
        createdAt: now,
        updatedAt: now,
      };

      mockSipTrunks.unshift(trunk);
      const configResults = await regenerateMockConfigs();

      return res.status(201).json({
        trunk: sanitizeTrunk(trunk),
        config: configResults,
      });
    }

    const trunk = await SipTrunk.create(normalizeBody(req.body));
    return regenerateConfigs(res, trunk, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Carrier ID already exists" });
    }

    return res.status(400).json({ error: error.message });
  }
};

export const getSipTrunks = async (_req, res) => {
  try {
    if (isMockMode()) {
      return res.json(mockSipTrunks.map(sanitizeTrunk));
    }

    const trunks = await SipTrunk.find().select(publicFields).sort({ createdAt: -1 });
    return res.json(trunks);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSipTrunk = async (req, res) => {
  try {
    if (isMockMode()) {
      const trunk = mockSipTrunks.find((item) => item._id === req.params.id);
      if (!trunk) return res.status(404).json({ error: "SIP trunk not found" });

      return res.json(sanitizeTrunk(trunk));
    }

    const trunk = await SipTrunk.findById(req.params.id).select(publicFields);
    if (!trunk) return res.status(404).json({ error: "SIP trunk not found" });

    return res.json(trunk);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateSipTrunk = async (req, res) => {
  try {
    const payload = normalizeBody(req.body);
    if (!payload.password) delete payload.password;

    if (isMockMode()) {
      const index = mockSipTrunks.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "SIP trunk not found" });

      const duplicate = mockSipTrunks.find(
        (item) => item._id !== req.params.id && item.carrierId === payload.carrierId,
      );
      if (duplicate) return res.status(409).json({ error: "Carrier ID already exists" });

      mockSipTrunks[index] = {
        ...mockSipTrunks[index],
        ...payload,
        updatedAt: new Date(),
      };

      const configResults = await regenerateMockConfigs();

      return res.json({
        trunk: sanitizeTrunk(mockSipTrunks[index]),
        config: configResults,
      });
    }

    const trunk = await SipTrunk.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).select("+password");

    if (!trunk) return res.status(404).json({ error: "SIP trunk not found" });

    return regenerateConfigs(res, trunk);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Carrier ID already exists" });
    }

    return res.status(400).json({ error: error.message });
  }
};

export const deleteSipTrunk = async (req, res) => {
  try {
    if (isMockMode()) {
      const index = mockSipTrunks.findIndex((item) => item._id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "SIP trunk not found" });

      mockSipTrunks.splice(index, 1);
      const configResults = await regenerateMockConfigs();

      return res.json({
        success: true,
        config: configResults,
      });
    }

    const trunk = await SipTrunk.findByIdAndDelete(req.params.id);
    if (!trunk) return res.status(404).json({ error: "SIP trunk not found" });

    const configResults = await generateAllSipConfigs();

    return res.json({
      success: true,
      config: configResults,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const regenerateSipTrunkConfig = async (_req, res) => {
  try {
    if (isMockMode()) {
      const configResults = await regenerateMockConfigs();
      return res.json({ success: true, config: configResults });
    }

    const configResults = await generateAllSipConfigs();
    return res.json({ success: true, config: configResults });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
