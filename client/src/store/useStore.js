import { create } from "zustand";
import { getSocket } from "../utils/socket";
import API from "../api/client";
import {
  fetchCustomers,
  fetchAnalytics,
  placeOutboundCall,
} from "../api/api";
import {
  getLocalStream,
  setMicrophoneEnabled,
  stopLocalStream,
} from "../webrtc/media";
import {
  closePeerConnection,
  createPeerConnection,
} from "../webrtc/peer";

const leadSeeds = [
  {
    id: "ld-1001",
    name: "Aarav Sharma",
    company: "Nimbus Labs",
    phone: "+91 98765 43210",
    email: "aarav@nimbuslabs.io",
    status: "Interested",
    priority: "Hot",
    lastTouch: "2 min ago",
    notes: [
      "Asked for pricing breakdown for 20-agent onboarding.",
      "Prefers WhatsApp follow-up after 6 PM.",
    ],
  },
  {
    id: "ld-1002",
    name: "Meera Iyer",
    company: "Orbit Retail",
    phone: "+91 99887 76655",
    email: "meera@orbitretail.in",
    status: "Contacted",
    priority: "Warm",
    lastTouch: "18 min ago",
    notes: ["Interested in call recording and CRM sync."],
  },
  {
    id: "ld-1003",
    name: "Rohan Verma",
    company: "BluePeak Finance",
    phone: "+91 90123 45678",
    email: "rohan@bluepeak.finance",
    status: "New",
    priority: "Warm",
    lastTouch: "35 min ago",
    notes: ["Requested callback tomorrow morning."],
  },
  {
    id: "ld-1004",
    name: "Priya Nair",
    company: "ZenCargo",
    phone: "+91 91234 56789",
    email: "priya@zencargo.co",
    status: "Closed",
    priority: "Cold",
    lastTouch: "1 day ago",
    notes: ["Deal won. Waiting for implementation kickoff."],
  },
];

const agentStatuses = [
  { id: "ag-1", name: "Ritika", status: "Available", calls: 14 },
  { id: "ag-2", name: "Kabir", status: "On Call", calls: 11 },
  { id: "ag-3", name: "Sana", status: "Break", calls: 8 },
];

const formatElapsed = (startedAt) => {
  if (!startedAt) return "00:00";

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const formatDuration = (seconds) => {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

export const useStore = create((set, get) => ({
  activeView: "dialer",
  dialedNumber: "",
  leads: [],
  selectedLeadId: null,
  activeCall: null,
  isCalling: false,
  callingNumber: "",
  agentAvailability: "Available",
  agents: agentStatuses,
  activityFeed: [
    { id: "ac-1", type: "call", text: "Call connected with Aarav Sharma", time: "Just now" },
    { id: "ac-2", type: "note", text: "Pricing note added to Orbit Retail", time: "12 min ago" },
    { id: "ac-3", type: "status", text: "Priya Nair moved to Closed", time: "1 hr ago" },
  ],
  backendOnline: null,
  backendStatusMessage: "Checking backend...",
  callError: "",
  leadsLoading: false,
  leadsError: "",
  analytics: {
    callsHandled: 0,
    missedCalls: 0,
    csat: 0,
    conversionRate: 0,
    avgHandleTime: "00:00",
  },
  setActiveView: (view) => set({ activeView: view }),
  setDialedNumber: (value) => set({ dialedNumber: value }),
  appendDigit: (value) =>
    set((state) => ({
      dialedNumber: `${state.dialedNumber}${value}`.slice(0, 15),
    })),
  backspaceDialedNumber: () =>
    set((state) => ({ dialedNumber: state.dialedNumber.slice(0, -1) })),
  selectLead: (leadId) => set({ selectedLeadId: leadId }),
  setAgentAvailability: (status) => set({ agentAvailability: status }),
  pushActivity: (entry) =>
    set((state) => ({
      activityFeed: [
        {
          id: entry.id || `${Date.now()}-${entry.type || "activity"}`,
          type: entry.type || "status",
          text: entry.text || "New activity",
          time: entry.time || "Just now",
        },
        ...state.activityFeed.slice(0, 5),
      ],
    })),
  startCall: async ({ number, leadId } = {}) => {
    const state = get();

    const lead = state.leads.find(
      (item) => item.id === (leadId ?? state.selectedLeadId)
    );

    const resolvedNumber =
      number ||
      lead?.phone ||
      state.dialedNumber ||
      "+91 90000 00000";

    const socket = getSocket();
    const callId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    set({
      isCalling: true,
      callingNumber: resolvedNumber,
      callError: "",
    });

    try {
      const stream = await getLocalStream();
      const peer = createPeerConnection({
        onIceCandidate: (candidate) => {
          socket?.emit("webrtc_ice_candidate", {
            callId,
            candidate,
          });
        },
      });

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });

      await peer.setLocalDescription(offer);

      socket?.emit("start_call", {
        callId,
        number: resolvedNumber,
        customer: lead || null,
      });

      socket?.emit("webrtc_offer", {
        callId,
        number: resolvedNumber,
        customer: lead || null,
        offer,
      });

      set({
        agentAvailability: "On Call",
        isCalling: false,
        callingNumber: "",
        dialedNumber: "",
        activeCall: {
          id: callId,
          leadId: lead?.id ?? null,
          name: lead?.name ?? "Unknown Caller",
          company: lead?.company ?? "Manual Dial",
          number: resolvedNumber,
          startedAt: Date.now(),
          muted: false,
          onHold: false,
          transport: "webrtc",
        },
      });
    } catch (error) {
      closePeerConnection();
      stopLocalStream();

      set({
        activeCall: null,
        agentAvailability: "Available",
        isCalling: false,
        callingNumber: "",
        callError: error.message || "Unable to start WebRTC call",
      });

      get().pushActivity({
        type: "status",
        text: "Microphone permission is required before starting a WebRTC call",
        time: "Just now",
      });

      throw error;
    }
  },

  endCall: () => {
    const socket = getSocket();
    const activeCall = get().activeCall;

    socket?.emit("end_call");
    socket?.emit("webrtc_call_ended", {
      callId: activeCall?.id,
    });

    closePeerConnection();
    stopLocalStream();

    const state = get();
    set({
      activeCall: null,
      isCalling: false,
      callingNumber: "",
      callError: "",
      agentAvailability: "Available",
      activityFeed: [
        {
          id: `${Date.now()}-end`,
          type: "call",
          text: "Call ended and summary synced to CRM",
          time: "Just now",
        },
        ...state.activityFeed.slice(0, 5),
      ],
    });
  },

  clearWebRtcCall: () => {
    closePeerConnection();
    stopLocalStream();

    set({
      activeCall: null,
      isCalling: false,
      callingNumber: "",
      callError: "",
      agentAvailability: "Available",
    });
  },

  toggleMute: () =>
    set((state) => {
      if (!state.activeCall) return { activeCall: null };

      const muted = !state.activeCall.muted;
      setMicrophoneEnabled(!muted && !state.activeCall.onHold);

      return {
        activeCall: { ...state.activeCall, muted },
      };
    }),
  toggleHold: () =>
    set((state) => {
      if (!state.activeCall) return { activeCall: null };

      const onHold = !state.activeCall.onHold;
      setMicrophoneEnabled(!onHold && !state.activeCall.muted);

      return {
        activeCall: { ...state.activeCall, onHold },
      };
    }),
  updateLeadStatus: (leadId, status) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, status, lastTouch: "Just now" } : lead,
      ),
      activityFeed: [
        {
          id: `${Date.now()}-status`,
          type: "status",
          text: `Lead updated to ${status}`,
          time: "Just now",
        },
        ...state.activityFeed.slice(0, 5),
      ],
    })),
  addLeadNote: (leadId, note) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, notes: [note, ...lead.notes], lastTouch: "Just now" } : lead,
      ),
      activityFeed: [
        {
          id: `${Date.now()}-note`,
          type: "note",
          text: "New note added to lead timeline",
          time: "Just now",
        },
        ...state.activityFeed.slice(0, 5),
      ],
    })),
  getSelectedLead: () => {
    const state = get();
    return state.leads.find((lead) => lead.id === state.selectedLeadId) ?? null;
  },
  getActiveCallDuration: () => formatElapsed(get().activeCall?.startedAt),

  // Backend Integration Functions
  checkBackendHealth: async () => {
    try {
      await API.get("/health");
      set({ backendOnline: true, backendStatusMessage: "Online" });
      return true;
    } catch (error) {
      console.error("Backend health check failed:", error);
      set({ backendOnline: false, backendStatusMessage: "Backend unavailable" });
      return false;
    }
  },

  loadCustomersFromBackend: async () => {
    set({ leadsLoading: true, leadsError: "" });
    try {
      const res = await fetchCustomers();
      const leads = res.data.map((customer) => ({
        id: customer._id || customer.id || `${customer.phone}`,
        name: customer.name,
        phone: customer.phone,
        status: customer.status || "New",
        company: customer.company || "Unknown Company",
        email: customer.email || "",
        priority: "Warm",
        lastTouch: "Just now",
        notes: Array.isArray(customer.notes) ? customer.notes : [],
      }));

      set({
        leads,
        selectedLeadId: leads[0]?.id ?? null,
        backendOnline: true,
        backendStatusMessage: "Backend online",
        leadsLoading: false,
        leadsError: "",
      });
    } catch (error) {
      console.error("Customer load failed:", error);
      set({
        leads: [],
        selectedLeadId: null,
        backendOnline: false,
        backendStatusMessage: "Backend unavailable",
        leadsLoading: false,
        leadsError: "Unable to load leads from backend",
      });
    }
  },

  loadAnalyticsFromBackend: async () => {
    try {
      const res = await fetchAnalytics();

      set({
        analytics: {
          callsHandled: res.data.callsHandled ?? res.data.total ?? 0,
          missedCalls: res.data.missedCalls ?? res.data.missed ?? 0,
          conversionRate:
            res.data.conversionRate ??
            (res.data.total ? Math.round(((res.data.completed || 0) / res.data.total) * 100) : 0),
          avgHandleTime:
            res.data.avgHandleTime || formatDuration(res.data.avgDuration || 0),
          csat: res.data.csat ?? 0,
        },
        backendOnline: true,
        backendStatusMessage: "Backend online",
      });
    } catch (error) {
      console.error("Analytics load failed:", error);
      set({
        analytics: {
          callsHandled: 0,
          missedCalls: 0,
          csat: 0,
          conversionRate: 0,
          avgHandleTime: "00:00",
        },
        backendOnline: false,
        backendStatusMessage: "Backend unavailable",
      });
    }
  },

  makeRealCall: async (phoneNumber) => {
    set({
      isCalling: true,
      callingNumber: phoneNumber,
      callError: "",
    });

    try {
      const response = await placeOutboundCall(phoneNumber);
      await get().startCall({ number: phoneNumber });

      return response.data;
    } catch (error) {
      set({
        isCalling: false,
        callingNumber: "",
        callError: error.message || "Unable to place call",
      });
      throw error;
    }
  },
}));
