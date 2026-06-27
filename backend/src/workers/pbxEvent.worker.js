import eventBus from "../events/eventBus.js";
import { getIO } from "../socket.js";
import logger from "../telemetry/logger.js";
import asteriskAdapter from "../adapters/asterisk.adapter.js";
import Call from "../models/Call.js";
import SipExtension from "../models/SipExtension.js";
import callService from "../services/callService.js";
import {
  SIP_REGISTERED,
  SIP_UNREGISTERED,
  SIP_INVITE,
  SIP_FAILED,
} from "../events/sip.events.js";
import {
  CALL_STARTED,
  CALL_ENDED,
  CALL_FAILED,
} from "../events/call.events.js";

const broadcast = (event, payload) => {
  try {
    getIO().emit(event, payload);
  } catch {
    // Socket not ready during tests
  }
};

const onSipRegistered = (payload) => {
  logger.info({ extension: payload?.extension }, "SIP extension registered");
  broadcast("sip_registered", payload);
};

const onSipUnregistered = (payload) => {
  logger.info({ extension: payload?.extension }, "SIP extension unregistered");
  broadcast("sip_unregistered", payload);
};

const onSipInvite = (payload) => {
  logger.info({ extension: payload?.extension }, "SIP INVITE");
  broadcast("sip_invite", payload);
};

const onSipFailed = (payload) => {
  logger.warn({ extension: payload?.extension, reason: payload?.reason }, "SIP failed");
  broadcast("sip_failed", payload);
};

const onCallStarted = (payload) => {
  broadcast("call_ringing", payload);
};

const onCallEnded = (payload) => {
  broadcast("call_ended", payload);
};

const onCallFailed = (payload) => {
  broadcast("call_failed", payload);
};

export const registerPbxWorkers = () => {
  eventBus.on(SIP_REGISTERED, onSipRegistered);
  eventBus.on(SIP_UNREGISTERED, onSipUnregistered);
  eventBus.on(SIP_INVITE, onSipInvite);
  eventBus.on(SIP_FAILED, onSipFailed);
  eventBus.on(CALL_STARTED, onCallStarted);
  eventBus.on(CALL_ENDED, onCallEnded);
  eventBus.on(CALL_FAILED, onCallFailed);

  if (asteriskAdapter.isAvailable()) {
    asteriskAdapter.connect()
      .then((manager) => {
        if (!manager) return;

        logger.info("PBX worker connected to Asterisk AMI event stream");
        const channelMap = new Map();

        manager.on("managerevent", async (evt) => {
          const { event, channel, uniqueid, calleridnum, exten, channelstatedesc } = evt;

          if (!uniqueid) return;

          // Event 1: Newchannel (ringing/initiated)
          if (event === "Newchannel") {
            try {
              const extensionRecord = await SipExtension.findOne({ extension: calleridnum });
              let call = null;
              if (extensionRecord) {
                call = await Call.findOne({
                  status: { $in: ["ringing", "waiting"] },
                  agentId: extensionRecord.userId,
                });
              }

              if (!call) {
                call = await Call.findOne({
                  status: { $in: ["ringing", "waiting"] },
                  phone: exten,
                });
              }

              if (call) {
                channelMap.set(uniqueid, call.callId);
                logger.debug({ uniqueid, callId: call.callId }, "Mapped Asterisk channel to call record");
              }
            } catch (err) {
              logger.error({ err, uniqueid }, "Error mapping channel on Newchannel");
            }
          }

          // Event 2: Newstate (call answered / connected)
          if (event === "Newstate" && channelstatedesc === "Up") {
            const callId = channelMap.get(uniqueid);
            if (callId) {
              try {
                const call = await Call.findOne({ callId });
                if (call && call.status !== "connected") {
                  call.status = "connected";
                  call.startTime = new Date();
                  await call.save();

                  const payload = call.toObject();
                  broadcast("call_connected", payload);
                  logger.info({ callId, uniqueid }, "Asterisk call connected via AMI");
                }
              } catch (err) {
                logger.error({ err, callId }, "Error processing Asterisk call connected event");
              }
            }
          }

          // Event 3: Hangup (call ended)
          if (event === "Hangup") {
            const callId = channelMap.get(uniqueid);
            if (callId) {
              channelMap.delete(uniqueid);
              try {
                await callService.endCall({ id: callId, disposition: "completed" });
                logger.info({ callId, uniqueid }, "Asterisk call hung up via AMI");
              } catch (err) {
                logger.warn({ err, callId }, "Error ending Asterisk call from AMI event");
              }
            }
          }
        });
      })
      .catch((err) => {
        logger.error({ err }, "Asterisk AMI connection failed in pbxEvent.worker");
      });
  }

  logger.debug("PBX event workers registered");
};
