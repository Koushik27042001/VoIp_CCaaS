import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import { initSocket } from "./utils/socket";
import { useStore } from "./store/useStore";
import "./styles/globals.css";

export default function App() {
  const loadCustomersFromBackend = useStore(
    (state) => state.loadCustomersFromBackend
  );

  const loadAnalyticsFromBackend = useStore(
    (state) => state.loadAnalyticsFromBackend
  );

  const checkBackendHealth = useStore((state) => state.checkBackendHealth);

  useEffect(() => {
    initSocket();

    checkBackendHealth();
    loadCustomersFromBackend();
    loadAnalyticsFromBackend();
  }, [checkBackendHealth, loadCustomersFromBackend, loadAnalyticsFromBackend]);

  return <Dashboard />;
}
