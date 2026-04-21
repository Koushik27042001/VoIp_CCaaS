import { create } from "zustand";
import * as api from "../api";
import { getSocket } from "../utils/socket";

// ==================== LOGGING SYSTEM ====================
const logger = {
  info: (message, data) => console.log(`ℹ️ ${message}`, data || ''),
  error: (message, error) => console.error(`❌ ${message}`, error),
  success: (message, data) => console.log(`✅ ${message}`, data || ''),
  warn: (message, data) => console.warn(`⚠️ ${message}`, data || ''),
};

// ==================== UTILITY FUNCTIONS ====================
const formatElapsed = (startedAt) => {
  if (!startedAt) return "00:00";
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

// Transform backend customer data to frontend format
const transformCustomerToLead = (customer) => ({
  id: customer._id || customer.id,
  name: customer.name,
  company: customer.company || 'Unknown Company',
  phone: customer.phone,
  email: customer.email,
  status: customer.status || 'New',
  priority: customer.tags?.includes('hot') ? 'Hot' :
           customer.tags?.includes('warm') ? 'Warm' : 'Cold',
  lastTouch: customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : 'Never',
  notes: customer.notes ? [customer.notes] : [],
});

// Transform backend analytics to frontend format
const transformAnalytics = (backendData) => ({
  callsHandled: backendData.total || 0,
  missedCalls: backendData.missed || 0,
  csat: 4.6, // Static for now, can be made dynamic later
  conversionRate: backendData.completed ? Math.round((backendData.completed / backendData.total) * 100) : 0,
  avgHandleTime: backendData.avgDuration ? `${Math.floor(backendData.avgDuration / 60)}:${String(backendData.avgDuration % 60).padStart(2, '0')}` : '00:00',
});

export const useStore = create((set, get) => ({
  // ==================== STATE ====================
  activeView: "dialer",
  dialedNumber: "",
  leads: [], // Start empty, load from backend
  selectedLeadId: null,
  activeCall: null,
  agentAvailability: "Available",
  agents: [], // Start empty, load from backend if needed
  activityFeed: [], // Start empty, populate from real events
  analytics: {
    callsHandled: 0,
    missedCalls: 0,
    csat: 0,
    conversionRate: 0,
    avgHandleTime: "00:00",
  },
  isLoading: {
    customers: false,
    analytics: false,
    call: false,
  },
  error: null,

  // ==================== ACTIONS ====================
  setActiveView: (view) => {
    logger.info(`View changed to: ${view}`);
    set({ activeView: view });
  },

  setDialedNumber: (value) => set({ dialedNumber: value }),

  appendDigit: (value) =>
    set((state) => ({
      dialedNumber: `${state.dialedNumber}${value}`.slice(0, 15),
    })),

  backspaceDialedNumber: () =>
    set((state) => ({ dialedNumber: state.dialedNumber.slice(0, -1) })),

  selectLead: (leadId) => {
    logger.info(`Lead selected: ${leadId}`);
    set({ selectedLeadId: leadId });
  },

  setAgentAvailability: (status) => {
    logger.info(`Agent availability changed to: ${status}`);
    set({ agentAvailability: status });
  },

  // ==================== BACKEND INTEGRATION ====================

  // Load customers from backend
  loadCustomersFromBackend: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, customers: true }, error: null }));

    try {
      logger.info("Loading customers from backend...");
      const response = await api.fetchCustomers();
      const transformedLeads = response.data.map(transformCustomerToLead);

      set({
        leads: transformedLeads,
        selectedLeadId: transformedLeads.length > 0 ? transformedLeads[0].id : null,
        isLoading: { customers: false },
      });

      logger.success(`Loaded ${transformedLeads.length} customers from backend`);
    } catch (error) {
      logger.error("Failed to load customers from backend", error);
      set({
        error: "Failed to load customers",
        isLoading: { customers: false },
        leads: [], // Keep empty on error
      });
    }
  },

  // Get customer by phone (for dialer lookup)
  getCustomerByPhone: async (phone) => {
    try {
      logger.info(`Looking up customer by phone: ${phone}`);
      const response = await api.fetchCustomerByPhone(phone);
      const customer = transformCustomerToLead(response.data);
      logger.success(`Found customer: ${customer.name}`);
      return customer;
    } catch (error) {
      logger.warn(`Customer not found for phone: ${phone}`);
      return null;
    }
  },

  // Make real call via backend
  makeRealCall: async (phone) => {
    set((state) => ({ isLoading: { ...state.isLoading, call: true }, error: null }));

    try {
      logger.info(`Making call to: ${phone}`);
      const response = await api.makeCall(phone);

      // Update active call with backend data
      set({
        activeCall: {
          id: response.data.callId,
          phone,
          startedAt: Date.now(),
          status: 'ringing',
        },
        isLoading: { call: false },
      });

      logger.success(`Call initiated: ${response.data.callId}`);
      return response.data;
    } catch (error) {
      logger.error("Failed to make call", error);
      set({
        error: "Failed to make call",
        isLoading: { call: false },
      });
      throw error;
    }
  },

  // Save call note to backend
  saveCallNoteToBackend: async (callId, notes, disposition) => {
    try {
      logger.info(`Saving call note for call: ${callId}`);
      await api.addCallNote(callId, notes, disposition);
      logger.success("Call note saved");
    } catch (error) {
      logger.error("Failed to save call note", error);
      throw error;
    }
  },

  // Load analytics from backend
  loadAnalyticsFromBackend: async () => {
    set((state) => ({ isLoading: { ...state.isLoading, analytics: true }, error: null }));

    try {
      logger.info("Loading analytics from backend...");
      const response = await api.fetchAnalytics();
      const transformedAnalytics = transformAnalytics(response.data);

      set({
        analytics: transformedAnalytics,
        isLoading: { analytics: false },
      });

      logger.success("Analytics loaded from backend", transformedAnalytics);
    } catch (error) {
      logger.error("Failed to load analytics", error);
      set({
        error: "Failed to load analytics",
        isLoading: { analytics: false },
      });
    }
  },

  // Load call history from backend
  loadCallHistoryFromBackend: async () => {
    try {
      logger.info("Loading call history from backend...");
      const response = await api.fetchCallHistory();
      logger.success(`Loaded ${response.data.length} call records`);
      return response.data;
    } catch (error) {
      logger.error("Failed to load call history", error);
      return [];
    }
  },

  // Authentication
  loginUser: async (email, password) => {
    try {
      logger.info("Attempting login...");
      const response = await api.loginUser(email, password);

      // Store token
      localStorage.setItem('token', response.data.token);

      logger.success("Login successful");
      return response.data;
    } catch (error) {
      logger.error("Login failed", error);
      throw error;
    }
  },

  logoutUser: () => {
    logger.info("User logged out");
    localStorage.removeItem('token');
    set({
      leads: [],
      selectedLeadId: null,
      activeCall: null,
      analytics: {
        callsHandled: 0,
        missedCalls: 0,
        csat: 0,
        conversionRate: 0,
        avgHandleTime: "00:00",
      },
    });
  },

  // ==================== LEGACY FUNCTIONS (for fallback) ====================

  startCall: ({ number, leadId } = {}) => {
    logger.warn("Using fallback startCall (backend not available)");
    const callData = {
      id: `call-${Date.now()}`,
      phone: number,
      leadId,
      startedAt: Date.now(),
      status: 'connected',
    };

    set({ activeCall: callData });
    logger.info("Fallback call started", callData);
  },

  getSelectedLead: () => {
    const { leads, selectedLeadId } = get();
    return leads.find((lead) => lead.id === selectedLeadId) || null;
  },

  updateLeadStatus: (leadId, status) => {
    logger.info(`Updating lead ${leadId} status to: ${status}`);
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, status } : lead
      ),
    }));
  },

  addLeadNote: (leadId, note) => {
    logger.info(`Adding note to lead ${leadId}`);
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? { ...lead, notes: [...lead.notes, note] }
          : lead
      ),
    }));
  },

  toggleMute: () => {
    logger.info("Toggle mute");
    // Implementation for mute functionality
  },

  toggleHold: () => {
    logger.info("Toggle hold");
    // Implementation for hold functionality
  },

  endCall: () => {
    logger.info("Ending call");
    set({ activeCall: null });
  },

  getActiveCallDuration: () => {
    const { activeCall } = get();
    return formatElapsed(activeCall?.startedAt);
  },
}));
