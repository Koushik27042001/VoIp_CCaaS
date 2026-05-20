import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import { useAuthStore } from "../store/useAuthStore";

import LoginPage from "../pages/auth/LoginPage";
import SetupAdminPage from "../pages/auth/SetupAdminPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAgentsPage from "../pages/admin/AdminAgentsPage";
import AdminLeadsPage from "../pages/admin/AdminLeadsPage";
import LeadAssignmentPage from "../pages/admin/LeadAssignmentPage";
import AgentDashboard from "../pages/agent/AgentDashboard";
import MyLeadsPage from "../pages/agent/MyLeadsPage";
import CallHistoryPage from "../pages/agent/CallHistoryPage";

function HomeRedirect() {
  const { user, isAuthenticated, authLoading } = useAuthStore();

  if (authLoading) {
    return <div className="auth-loading-screen">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === "admin" ? "/admin" : "/agent"} replace />;
}

export default function AppRoutes() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupAdminPage />} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/agents" element={<ProtectedRoute role="admin"><AdminAgentsPage /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute role="admin"><AdminLeadsPage /></ProtectedRoute>} />
        <Route path="/admin/assignments" element={<ProtectedRoute role="admin"><LeadAssignmentPage /></ProtectedRoute>} />

        <Route path="/agent" element={<ProtectedRoute role="agent"><AgentDashboard /></ProtectedRoute>} />
        <Route path="/agent/leads" element={<ProtectedRoute role="agent"><MyLeadsPage /></ProtectedRoute>} />
        <Route path="/agent/calls" element={<ProtectedRoute role="agent"><CallHistoryPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
