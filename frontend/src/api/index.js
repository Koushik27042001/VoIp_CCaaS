import API from "./client";

// ==================== AUTHENTICATION ====================
export const loginUser = (email, password) =>
  API.post("/auth/login", { email, password });

export const registerUser = (name, email, password) =>
  API.post("/auth/register", { name, email, password });

// ==================== CUSTOMERS ====================
export const fetchCustomers = () =>
  API.get("/customers");

export const fetchCustomerByPhone = (phone) =>
  API.get(`/customers/${phone}`);

export const searchCustomers = (query) =>
  API.get("/customers/search", { params: { query } });

export const createCustomer = (customerData) =>
  API.post("/customers", customerData);

export const updateCustomer = (id, customerData) =>
  API.put(`/customers/${id}`, customerData);

// ==================== CALLS ====================
export const makeCall = (phone) =>
  API.post("/calls/outbound", { phone });

export const fetchCallHistory = () =>
  API.get("/calls/history");

export const addCallNote = (callId, notes, disposition) =>
  API.post(`/calls/${callId}/notes`, { notes, disposition });

// ==================== ANALYTICS ====================
export const fetchAnalytics = () =>
  API.get("/analytics/today");

export const fetchAgentAnalytics = (agentId) =>
  API.get(`/analytics/agent/${agentId}`);
