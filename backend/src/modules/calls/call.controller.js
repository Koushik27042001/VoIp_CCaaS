import mockCalls from "../../data/mockCalls.js";
import mockCustomers from "../../data/mockCustomers.js";
import { isMockMode } from "../../config/env.js";
import {
  addNoteToCall,
  createOutboundCall,
  endCall,
  getActiveCalls,
  listCallHistory,
} from "../../services/callService.js";
import { emitRealtimeEvent, REALTIME_EVENTS } from "../../events/realtime.events.js";
import logger from "../../utils/logger.js";

export const makeCall = async (req, res, next) => {
  try {
    const { phone, customerId } = req.body;
    const agentId = req.user?.id;

    if (isMockMode()) {
      const callId = Date.now().toString();
      const customer = mockCustomers.find((c) => c.phone === phone);
      const call = {
        _id: callId,
        callId,
        phone,
        agentId: agentId || "agent1",
        customer: customer || null,
        status: "ringing",
        duration: 0,
        startTime: new Date(),
        endTime: null,
        notes: "",
      };

      mockCalls.push(call);
      emitRealtimeEvent(REALTIME_EVENTS.CALL_STARTED, call);
      emitRealtimeEvent(REALTIME_EVENTS.CALL_RINGING, call);

      return res.status(201).json({ message: "Call started", call });
    }

    const call = await createOutboundCall({ phone, agentId, customerId });
    res.status(201).json({ message: "Call started", call });
  } catch (err) {
    next(err);
  }
};

export const getCallHistory = async (req, res, next) => {
  try {
    const query = req.validated?.query || req.query;

    if (isMockMode()) {
      return res.json([...mockCalls].reverse().slice(0, query.limit || 20));
    }

    const calls = await listCallHistory(query);
    res.json(calls);
  } catch (err) {
    next(err);
  }
};

export const getActiveCallList = async (req, res, next) => {
  try {
    if (isMockMode()) {
      return res.json(
        mockCalls.filter((call) =>
          ["waiting", "ringing", "connected", "active"].includes(call.status)
        )
      );
    }

    res.json(await getActiveCalls());
  } catch (err) {
    next(err);
  }
};

export const addCallNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, disposition } = req.body;

    if (isMockMode()) {
      const call = mockCalls.find((c) => c._id == id || c.callId == id);

      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }

      call.notes = notes;
      call.disposition = disposition;
      emitRealtimeEvent(REALTIME_EVENTS.CALL_NOTE_ADDED, call);
      return res.json(call);
    }

    const call = await addNoteToCall({ id, notes, disposition });

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.json(call);
  } catch (err) {
    next(err);
  }
};

export const endActiveCall = async (req, res, next) => {
  try {
    if (isMockMode()) {
      const call = mockCalls.find((c) => c.callId == req.params.id || c._id == req.params.id);

      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }

      call.status = "ended";
      call.endTime = new Date();
      call.duration = Math.floor((call.endTime - call.startTime) / 1000);
      call.disposition = req.body.disposition || "completed";
      emitRealtimeEvent(REALTIME_EVENTS.CALL_ENDED, call);
      return res.json(call);
    }

    const call = await endCall({
      id: req.params.id,
      disposition: req.body.disposition,
    });

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.json(call);
  } catch (err) {
    logger.error({ err }, "Failed to end call");
    next(err);
  }
};
