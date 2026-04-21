import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import { initSocket } from "./utils/socket";
import Logger from "./components/Logger";
import { useStore } from "./store/useStore";

export default function App() {
  const [logs, setLogs] = useState([]);
  const loadCustomersFromBackend = useStore((state) => state.loadCustomersFromBackend);

  // Add log function
  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-49), message]); // Keep last 50 logs
  };

  useEffect(() => {
    // Initialize Socket.io connection when app loads
    const socket = initSocket();
    addLog("✅ Socket.io connection initialized");

    // Load initial data
    const initializeApp = async () => {
      try {
        addLog("🔄 Loading customers from backend...");
        await loadCustomersFromBackend();
        addLog("✅ Customers loaded successfully");
      } catch (error) {
        addLog(`❌ Failed to load customers: ${error.message}`);
      }
    };

    initializeApp();

    return () => {
      // Cleanup on unmount
      addLog("🧹 App unmounting");
    };
  }, [loadCustomersFromBackend]);

  return (
    <>
      <Dashboard />
      <Logger logs={logs} />
    </>
  );
}

