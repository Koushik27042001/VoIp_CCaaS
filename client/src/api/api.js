import API from "./client";

export const fetchCustomers = () => API.get("/customers");

export const fetchAnalytics = () => API.get("/analytics");

export const fetchCallHistory = () => API.get("/calls/history");

export const placeOutboundCall = (phone, mode = "auto") =>
  API.post("/calls/outbound", { phone, mode });

export const hangupCall = (callId) => API.post("/calls/hangup", { callId });

export const fetchTwilioToken = () => API.get("/twilio/token");

export const fetchTwilioStatus = () => API.get("/twilio/status");

export const fetchSipConfig = () => API.get("/sip/config");

export const reportSipRegistration = (payload) =>
  API.post("/sip/registration", payload);

export const fetchSipHealth = () => API.get("/sip/health");

export const fetchSipTrunks = () => API.get("/sip-trunks");

export const createSipTrunk = (payload) => API.post("/sip-trunks", payload);

export const updateSipTrunk = (id, payload) =>
  API.put(`/sip-trunks/${id}`, payload);

export const deleteSipTrunk = (id) => API.delete(`/sip-trunks/${id}`);

export const regenerateSipTrunkConfig = () =>
  API.post("/sip-trunks/regenerate-config");

export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const setupAdmin = (payload) => API.post("/auth/setup", payload);

export const getMe = () => API.get("/auth/me");

export const createAgent = (payload) => API.post("/users/agents", payload);

export const fetchAgents = () => API.get("/users/agents");

export const fetchLeads = () => API.get("/leads");

export const createLead = (payload) => API.post("/leads", payload);

export const fetchLeadAssignments = () => API.get("/lead-assignments");

export const assignLead = (payload) =>
  API.post("/lead-assignments/assign", payload);

export const fetchMyLeads = () => API.get("/lead-assignments/my-leads");

export const updateLeadAssignmentStatus = (id, status) =>
  API.patch(`/lead-assignments/${id}/status`, { status });

export const addLeadAssignmentNote = (id, note) =>
  API.post(`/lead-assignments/${id}/notes`, { note });
