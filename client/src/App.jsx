import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import DialerPage from "./pages/DialerPage";
import LeadsPage from "./pages/LeadsPage";
import InsightsPage from "./pages/InsightsPage";
import OverviewPage from "./pages/OverviewPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";

import { initSocket } from "./utils/socket";
import { useStore } from "./store/useStore";

export default function App() {
  const loadCustomersFromBackend = useStore(
    (state) => state.loadCustomersFromBackend
  );

  const loadAnalyticsFromBackend = useStore(
    (state) => state.loadAnalyticsFromBackend
  );

  useEffect(() => {
    initSocket();

    loadCustomersFromBackend();
    loadAnalyticsFromBackend();
  }, []);

  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/dialer" element={<DialerPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}


