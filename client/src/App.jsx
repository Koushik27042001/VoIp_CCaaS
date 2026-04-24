import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import { initSocket } from "./utils/socket";
import { useStore } from "./store/useStore";
import "./styles-modern.css";

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

  return <Dashboard />;
}
