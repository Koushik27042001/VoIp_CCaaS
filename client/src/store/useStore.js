import { create } from "zustand";
import { getSocket } from "../utils/socket";
import API from "../api/client";
import {
  fetchCustomers,
  fetchAnalytics,
} from "../api/api";

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
  agentAvailability: "Available",
  agents: agentStatuses,
  activityFeed: [
    { id: "ac-1", type: "call", text: "Call connected with Aarav Sharma", time: "Just now" },
    { id: "ac-2", type: "note", text: "Pricing note added to Orbit Retail", time: "12 min ago" },
    { id: "ac-3", type: "status", text: "Priya Nair moved to Closed", time: "1 hr ago" },
  ],
  backendOnline: null,
  backendStatusMessage: "Checking backend...",
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
  startCall: ({ number, leadId } = {}) => {
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

    socket?.emit("start_call", {
      number: resolvedNumber,
      customer: lead || null,
    });

    set({
      agentAvailability: "On Call",
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
    const socket = getSocket();

    socket?.emit("end_call");

    const state = get();
    set({
      activeCall: null,
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

  toggleMute: () =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, muted: !state.activeCall.muted } : null,
    })),
  toggleHold: () =>
    set((state) => ({
      activeCall: state.activeCall ? { ...state.activeCall, onHold: !state.activeCall.onHold } : null,
    })),
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
      });
    } catch (error) {
      console.error("Customer load failed:", error);
      set({
        leads: [],
        selectedLeadId: null,
        backendOnline: false,
        backendStatusMessage: "Backend unavailable",
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
    const socket = getSocket();
    if (!socket) {
      throw new Error("Socket unavailable");
    }

    return new Promise((resolve, reject) => {
      socket.emit("start_call", { number: phoneNumber }, (response) => {
        if (response?.success) {
          const state = get();
          const lead = state.leads.find((item) => item.phone === phoneNumber);

          set({
            agentAvailability: "On Call",
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
          resolve(response);
        } else {
          reject(new Error(response?.error || "Call failed"));
        }
      });
    });
  },
}));
