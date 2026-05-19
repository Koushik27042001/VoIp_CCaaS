import API from "./client";

export const fetchCustomers = () => API.get("/customers");

export const fetchAnalytics = () => API.get("/analytics");

export const fetchCallHistory = () => API.get("/calls/history");

export const placeOutboundCall = (phone) =>
  API.post("/calls/outbound", { phone });

export const fetchSipConfig = () => API.get("/sip/config");

export const reportSipRegistration = (payload) =>
  API.post("/sip/registration", payload);

export const fetchSipHealth = () => API.get("/sip/health");

export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const setupAdmin = (payload) => API.post("/auth/setup", payload);

export const getMe = () => API.get("/auth/me");

export const createAgent = (payload) => API.post("/users/agents", payload);

export const fetchAgents = () => API.get("/users/agents");
