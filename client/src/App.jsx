import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import { getSocket, initSocket } from "./utils/socket";
import { useStore } from "./store/useStore";
import "./styles/globals.css";

export default function App() {
  const loadAnalyticsFromBackend = useStore(
    (state) => state.loadAnalyticsFromBackend
  );
  const checkBackendHealth = useStore((state) => state.checkBackendHealth);
  const pushActivity = useStore((state) => state.pushActivity);

  useEffect(() => {
    initSocket();

    checkBackendHealth();
    loadAnalyticsFromBackend();
  }, [checkBackendHealth, loadAnalyticsFromBackend]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onCallConnected = (call) => {
      const customerName = call?.customer?.name || call?.phone || "customer";
      pushActivity({
        type: "call",
        text: `Call connected with ${customerName}`,
        time: "Just now",
      });
    };

    const onLeadUpdated = (payload) => {
      const leadName = payload?.customer?.name || payload?.name || "Lead";
      const status = payload?.status || "updated";
      pushActivity({
        type: "status",
        text: `${leadName} updated to ${status}`,
        time: "Just now",
      });
    };

    socket.on("call_connected", onCallConnected);
    socket.on("lead_updated", onLeadUpdated);

    return () => {
      socket.off("call_connected", onCallConnected);
      socket.off("lead_updated", onLeadUpdated);
    };
  }, [pushActivity]);

  return <Dashboard />;
}
