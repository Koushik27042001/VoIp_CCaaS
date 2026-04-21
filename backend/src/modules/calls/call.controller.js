import { getIO } from "../../socket.js";
import mockCalls from "../../data/mockCalls.js";
import mockCustomers from "../../data/mockCustomers.js";

const USE_MOCK = process.env.USE_MOCK === "true";

export const makeCall = async (req, res) => {
  try {
    const { phone } = req.body;
    const agentId = req.user?.id || "agent1";

    if (!USE_MOCK) {
      // Future: Integrate with Twilio
      return res.status(501).json({ message: "Real calls not implemented yet" });
    }

    const io = getIO();
    const callId = Date.now().toString();

    // 🔍 Find customer
    const customer = mockCustomers.find((c) => c.phone === phone);

    // 🧾 Create call log
    const call = {
      _id: callId,
      phone,
      agentId,
      customer: customer || null,
      status: "ringing",
      duration: 0,
      startTime: new Date(),
      endTime: null,
      notes: "",
      disposition: "",
    };

    mockCalls.push(call);

    console.log("📞 Calling:", phone);

    // 📡 Emit ringing
    io.emit("call_ringing", call);

    // ⏱ Connected
    setTimeout(() => {
      call.status = "connected";
      console.log("✅ Call connected");
      io.emit("call_connected", call);
    }, 2000);

    // ⏱ End call
    setTimeout(() => {
      call.status = "ended";
      call.endTime = new Date();
      call.duration = Math.floor((call.endTime - call.startTime) / 1000);
      call.disposition = "completed";
      console.log("❌ Call ended");
      io.emit("call_ended", call);
    }, 8000);

    res.json({ message: "Call started (mock)", callId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Get Call History API
export const getCallHistory = async (req, res) => {
  try {
    if (USE_MOCK) {
      return res.json(mockCalls.reverse());
    }

    // Future: Get from database
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📝 Add Notes API
export const addCallNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, disposition } = req.body;

    if (USE_MOCK) {
      const call = mockCalls.find((c) => c._id == id);

      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }

      call.notes = notes;
      call.disposition = disposition;

      return res.json(call);
    }

    // Future: Update in database
    res.status(501).json({ message: "Not implemented yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
