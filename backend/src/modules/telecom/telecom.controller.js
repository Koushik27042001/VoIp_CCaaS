import { getAsteriskSnapshot } from "../../services/telecom/asteriskManager.js";
import { buildSipRuntimeConfig } from "../../services/telecom/sipRouting.js";
import getTrunkHealth from "../../services/telecom/trunkHealth.js";
import generateRuntimeConfig from "../../services/asterisk/generateRuntimeConfig.js";
import * as asteriskAdapter from "../../adapters/asterisk.adapter.js";
import * as twilioAdapter from "../../adapters/twilio.adapter.js";
import { asteriskConfig, isAsteriskEnabled } from "../../config/asterisk.js";
import {
  twilioConfig,
  isTwilioEnabled,
  isTwilioClientEnabled,
} from "../../config/twilio.js";

const check = (name, ok, detail = "") => ({ name, ok, detail });
const isProduction = process.env.NODE_ENV === "production";
const hasPublicHttpsUrl = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized.startsWith("https://") &&
    !normalized.includes("localhost") &&
    !normalized.includes("127.0.0.1")
  );
};

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

export const getTelecomReadiness = async (_req, res) => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const sharedChecks = [
    check("MONGO_URI", Boolean(mongoUri), "Required for user/extension lookup"),
    check("JWT_SECRET", Boolean(process.env.JWT_SECRET), "Required for protected call APIs"),
  ];

  const asteriskChecks = [
    check("ASTERISK_AMI_HOST", Boolean(asteriskConfig.ami.host)),
    check("ASTERISK_AMI_PORT", Boolean(asteriskConfig.ami.port)),
    check("ASTERISK_AMI_USER", Boolean(asteriskConfig.ami.username)),
    check("ASTERISK_AMI_PASSWORD", Boolean(asteriskConfig.ami.password)),
    check("ASTERISK_WS_PUBLIC_URL", Boolean(asteriskConfig.websocket.publicUrl)),
    check("ASTERISK_SIP_DOMAIN", Boolean(asteriskConfig.sip.domain)),
  ];

  const twilioChecks = [
    check("TWILIO_ACCOUNT_SID", Boolean(twilioConfig.accountSid)),
    check("TWILIO_AUTH_TOKEN", Boolean(twilioConfig.authToken)),
    check("TWILIO_PHONE_NUMBER", Boolean(twilioConfig.phoneNumber)),
    check(
      "PUBLIC_API_URL",
      isProduction
        ? hasPublicHttpsUrl(twilioConfig.webhookBaseUrl)
        : Boolean(twilioConfig.webhookBaseUrl),
      isProduction
        ? "Must be public HTTPS URL (ngrok/domain), not localhost"
        : "Dev mode: localhost allowed. Use public HTTPS URL for production webhooks."
    ),
  ];

  const twilioClientChecks = [
    check("TWILIO_API_KEY_SID", Boolean(twilioConfig.apiKeySid)),
    check("TWILIO_API_SECRET", Boolean(twilioConfig.apiSecret)),
    check("TWILIO_TWIML_APP_SID", Boolean(twilioConfig.twimlAppSid)),
  ];

  const asteriskRuntime =
    isAsteriskEnabled() && asteriskChecks.every((x) => x.ok)
      ? await asteriskAdapter.ping()
      : { ok: false, skipped: true, reason: "Asterisk is not enabled in env" };
  const twilioRuntime =
    isTwilioEnabled() && twilioChecks.every((x) => x.ok)
      ? await twilioAdapter.ping()
      : { ok: false, skipped: true, reason: "Twilio is not enabled in env" };

  const sharedReady = sharedChecks.every((x) => x.ok);
  const asteriskReady =
    isAsteriskEnabled() &&
    asteriskChecks.every((x) => x.ok) &&
    Boolean(asteriskRuntime.ok);
  const twilioReady =
    isTwilioEnabled() &&
    twilioChecks.every((x) => x.ok) &&
    Boolean(twilioRuntime.ok);
  const twilioClientReady =
    isTwilioClientEnabled() &&
    twilioChecks.every((x) => x.ok) &&
    twilioClientChecks.every((x) => x.ok) &&
    Boolean(twilioRuntime.ok);

  const providerReady = asteriskReady || twilioReady || twilioClientReady;

  res.json({
    ready: sharedReady && providerReady,
    summary:
      sharedReady && providerReady
        ? "Ready for outbound calling."
        : "Not ready. Resolve blockers.",
    mode: process.env.USE_MOCK === "true" ? "mock" : "production",
    providers: {
      asterisk: {
        enabled: isAsteriskEnabled(),
        ready: asteriskReady,
        checks: asteriskChecks,
        runtime: asteriskRuntime,
      },
      twilioPstn: {
        enabled: isTwilioEnabled(),
        ready: twilioReady,
        checks: twilioChecks,
        runtime: twilioRuntime,
      },
      twilioClient: {
        enabled: isTwilioClientEnabled(),
        ready: twilioClientReady,
        checks: [...twilioChecks, ...twilioClientChecks],
        runtime: twilioRuntime,
      },
    },
    sharedChecks,
    blockers: [
      ...sharedChecks.filter((x) => !x.ok).map((x) => x.name),
      ...(isAsteriskEnabled() && !asteriskRuntime.ok
        ? [`ASTERISK_AMI_CONNECTION: ${asteriskRuntime.error || "Connection failed"}`]
        : []),
      ...(isTwilioEnabled() && !twilioRuntime.ok
        ? [`TWILIO_AUTH: ${twilioRuntime.error || "Credential validation failed"}`]
        : []),
      ...(providerReady ? [] : ["No telecom provider is fully configured."]),
    ],
  });
};
