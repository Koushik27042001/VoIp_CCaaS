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
import SIPTrunkPage from "../pages/settings/SIPTrunkPage";
import AgentLayout from "../layouts/AgentLayout";

export default function AppRoutes() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/agent" replace />} />
        <Route path="/login" element={<Navigate to="/agent" replace />} />
        <Route path="/setup" element={<SetupAdminPage />} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/agents" element={<ProtectedRoute role="admin"><AdminAgentsPage /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute role="admin"><AdminLeadsPage /></ProtectedRoute>} />
        <Route path="/admin/assignments" element={<ProtectedRoute role="admin"><LeadAssignmentPage /></ProtectedRoute>} />

        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/agent/leads" element={<MyLeadsPage />} />
        <Route path="/agent/calls" element={<CallHistoryPage />} />
        <Route
          path="/agent/settings/sip-trunks"
          element={
            <AgentLayout>
              <SIPTrunkPage />
            </AgentLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
