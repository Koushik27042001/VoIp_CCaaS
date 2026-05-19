import API from "./client";

export const fetchCustomers = () =>
  API.get("/customers");

export const fetchAnalytics = () =>
  API.get("/analytics");

export const fetchCallHistory = () =>
  API.get("/calls/history");

export const placeOutboundCall = (phone) =>
  API.post("/calls/outbound", { phone });

export const fetchSipTrunks = () =>
  API.get("/sip-trunks");

export const createSipTrunk = (payload) =>
  API.post("/sip-trunks", payload);

export const updateSipTrunk = (id, payload) =>
  API.put(`/sip-trunks/${id}`, payload);

export const deleteSipTrunk = (id) =>
  API.delete(`/sip-trunks/${id}`);

export const regenerateSipTrunkConfig = () =>
  API.post("/sip-trunks/regenerate-config");

export const fetchTelecomStatus = () =>
  API.get("/telecom/status");

export const fetchTrunkHealth = () =>
  API.get("/telecom/trunk-health");

export const fetchSipRuntimePlan = () =>
  API.get("/telecom/sip-runtime-plan");

export const generateSipRuntimeConfig = () =>
  API.post("/telecom/generate-runtime-config");
