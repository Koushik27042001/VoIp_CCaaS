import { create } from "zustand";
import { getSocket } from "../utils/socket";
import {
  fetchCustomers,
  fetchAnalytics,
  placeOutboundCall,
  fetchSipConfig,
  reportSipRegistration,
} from "../api/api";
import { registerSipAgent, unregisterSipAgent } from "../telecom/sipClient";

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
    { id: "ac-1", type: "call", text: "Call connected", time: "Just now" },
  ],
  sipStatus: "offline",
  backendOnline: null,
  backendStatusMessage: "Checking backend...",
  socketEventsBound: false,
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
  startCall: ({ number, leadId } = {}) => {
    const state = get();
    const lead = state.leads.find(
      (item) => item.id === (leadId ?? state.selectedLeadId)
    );
    const resolvedNumber =
      number || lead?.phone || state.dialedNumber || "";

    getSocket()?.emit("start_call", {
      number: resolvedNumber,
      customer: lead || null,
    });

    set({
      agentAvailability: "On Call",
      isCalling: false,
      callingNumber: "",
      dialedNumber: "",
      activeCall: {
        leadId: lead?.id ?? null,
        name: lead?.name ?? "Unknown Caller",
        company: lead?.company ?? "Manual Dial",
        number: resolvedNumber,
        startedAt: Date.now(),
        muted: false,
        onHold: false,
      },
    });
  },
  endCall: () => {
    getSocket()?.emit("end_call");
    const state = get();
    set({
      activeCall: null,
      isCalling: false,
      callingNumber: "",
      agentAvailability: "Available",
      activityFeed: [
        {
          id: `${Date.now()}-end`,
          type: "call",
          text: "Call ended",
          time: "Just now",
        },
        ...state.activityFeed.slice(0, 5),
      ],
    });
  },
  toggleMute: () =>
    set((state) => ({
      activeCall: state.activeCall
        ? { ...state.activeCall, muted: !state.activeCall.muted }
        : null,
    })),
  toggleHold: () =>
    set((state) => ({
      activeCall: state.activeCall
        ? { ...state.activeCall, onHold: !state.activeCall.onHold }
        : null,
    })),
  updateLeadStatus: (leadId, status) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, status, lastTouch: "Just now" } : lead
      ),
    })),
  addLeadNote: (leadId, note) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? { ...lead, notes: [note, ...(lead.notes || [])], lastTouch: "Just now" }
          : lead
      ),
    })),
  getSelectedLead: () => {
    const state = get();
    return state.leads.find((lead) => lead.id === state.selectedLeadId) ?? null;
  },
  getActiveCallDuration: () => formatElapsed(get().activeCall?.startedAt),
  checkBackendHealth: async () => {
    try {
      const { default: API } = await import("../api/client");
      await API.get("/health");
      set({ backendOnline: true, backendStatusMessage: "Online" });
      return true;
    } catch {
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
            (res.data.total
              ? Math.round(((res.data.completed || 0) / res.data.total) * 100)
              : 0),
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
  bindSocketCallEvents: () => {
    if (get().socketEventsBound) return;
    const socket = getSocket();
    socket.on("call_ringing", (call) => {
      set({
        isCalling: true,
        callingNumber: call.phone,
        activityFeed: [
          {
            id: `${Date.now()}-ring`,
            type: "call",
            text: `Ringing ${call.phone}`,
            time: "Just now",
          },
          ...get().activityFeed.slice(0, 5),
        ],
      });
    });
    socket.on("call_connected", (call) => {
      set({
        isCalling: false,
        agentAvailability: "On Call",
        activeCall: {
          leadId: null,
          name: call.phone,
          company: "Live call",
          number: call.phone,
          startedAt: Date.now(),
          muted: false,
          onHold: false,
        },
      });
    });
    socket.on("call_ended", () => {
      set({
        activeCall: null,
        isCalling: false,
        callingNumber: "",
        agentAvailability: "Available",
      });
    });
    set({ socketEventsBound: true });
  },
  initTelecom: async () => {
    const token = localStorage.getItem("token");
    if (!token || process.env.REACT_APP_AUTO_SIP_REGISTER === "false") {
      return;
    }
    try {
      const res = await fetchSipConfig();
      const config = res.data.data;
      set({ sipStatus: "registering" });
      await registerSipAgent(config, {
        onStateChange: async (state) => {
          let status = "offline";
          if (state === "Registered") status = "registered";
          else if (state === "Unregistered") status = "unregistered";
          else if (state === "Terminated") status = "failed";
          set({ sipStatus: status });
          try {
            await reportSipRegistration({
              extension: config.extension,
              status,
            });
          } catch (err) {
            console.error("SIP registration report failed:", err);
          }
        },
      });
      set({ sipStatus: "registered" });
    } catch (error) {
      console.error("SIP registration failed:", error);
      set({ sipStatus: "failed" });
    }
  },
  disconnectTelecom: async () => {
    await unregisterSipAgent();
    set({ sipStatus: "offline" });
  },
  makeRealCall: async (phoneNumber) => {
    const state = get();
    const lead = state.leads.find((item) => item.phone === phoneNumber);
    set({ isCalling: true, callingNumber: phoneNumber });
    try {
      const response = await placeOutboundCall(phoneNumber);
      set({
        agentAvailability: "On Call",
        isCalling: false,
        callingNumber: "",
        dialedNumber: "",
        activeCall: {
          leadId: lead?.id ?? null,
          name: lead?.name ?? phoneNumber,
          company: lead?.company ?? "Manual Dial",
          number: phoneNumber,
          startedAt: Date.now(),
          muted: false,
          onHold: false,
        },
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Call failed";
      set({
        isCalling: false,
        callingNumber: "",
        activityFeed: [
          {
            id: `${Date.now()}-fail`,
            type: "call",
            text: message,
            time: "Just now",
          },
          ...get().activityFeed.slice(0, 5),
        ],
      });
      throw error;
    }
  },
}));
