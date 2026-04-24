import API from "./client";

export const fetchCustomers = () =>
  API.get("/customers");

export const fetchAnalytics = () =>
  API.get("/analytics");

export const fetchCallHistory = () =>
  API.get("/calls/history");