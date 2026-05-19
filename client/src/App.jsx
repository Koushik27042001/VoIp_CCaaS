import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SetupAdminPage from "./pages/SetupAdminPage";
import DialerPage from "./pages/DialerPage";
import LeadsPage from "./pages/LeadsPage";
import InsightsPage from "./pages/InsightsPage";
import OverviewPage from "./pages/OverviewPage";
import SettingsPage from "./pages/SettingsPage";
import AdminAgentsPage from "./pages/AdminAgentsPage";
import NotFoundPage from "./pages/NotFoundPage";

import { initSocket } from "./utils/socket";
import { useStore } from "./store/useStore";
import { useAuthStore } from "./store/useAuthStore";

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authLoading = useAuthStore((s) => s.authLoading);

  const loadCustomersFromBackend = useStore((s) => s.loadCustomersFromBackend);
  const loadAnalyticsFromBackend = useStore((s) => s.loadAnalyticsFromBackend);
  const bindSocketCallEvents = useStore((s) => s.bindSocketCallEvents);
  const initTelecom = useStore((s) => s.initTelecom);
  const disconnectTelecom = useStore((s) => s.disconnectTelecom);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    initSocket();
    bindSocketCallEvents();
    loadCustomersFromBackend();
    loadAnalyticsFromBackend();
    initTelecom();

    return () => {
      disconnectTelecom();
    };
  }, [
    isAuthenticated,
    authLoading,
    bindSocketCallEvents,
    loadCustomersFromBackend,
    loadAnalyticsFromBackend,
    initTelecom,
    disconnectTelecom,
  ]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupAdminPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/dialer" element={<DialerPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin/agents" element={<AdminAgentsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
