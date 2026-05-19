import { create } from "zustand";
import {
  login as loginApi,
  getMe,
  setupAdmin,
  createAgent as createAgentApi,
  fetchAgents,
} from "../api/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  authLoading: true,
  authError: null,
  agents: [],
  agentsLoading: false,

  restoreSession: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ authLoading: false, isAuthenticated: false, token: null, user: null });
      return false;
    }

    set({ token, authLoading: true });

    try {
      const res = await getMe();
      set({
        user: res.data.user,
        isAuthenticated: true,
        authLoading: false,
        authError: null,
      });
      return true;
    } catch {
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        authLoading: false,
      });
      return false;
    }
  },

  login: async (email, password) => {
    set({ authError: null });
    try {
      const res = await loginApi(email, password);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      set({ token, user, isAuthenticated: true, authError: null });
      return user;
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed";
      set({ authError: message });
      throw error;
    }
  },

  setupAdminAccount: async ({ name, email, password }) => {
    set({ authError: null });
    const res = await setupAdmin({ name, email, password });
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true, authError: null });
    return user;
  },

  logout: () => {
    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      agents: [],
      authError: null,
    });
  },

  loadAgents: async () => {
    if (get().user?.role !== "admin") return;

    set({ agentsLoading: true });
    try {
      const res = await fetchAgents();
      set({ agents: res.data.users || [], agentsLoading: false });
    } catch (error) {
      set({ agentsLoading: false });
      throw error;
    }
  },

  createAgent: async (payload) => {
    const res = await createAgentApi(payload);
    await get().loadAgents();
    return res.data.user;
  },

  isAdmin: () => get().user?.role === "admin",
}));
