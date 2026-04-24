import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Analytics from "../components/Analytics";
import AgentStatus from "../components/AgentStatus";
import Dialer from "../components/Dialer";
import CRMPanel from "../components/CRMPanel";
import LeadPanel from "../components/LeadPanel";
import { useStore } from "../store/useStore";

export default function Dashboard() {
  const activeView = useStore((state) => state.activeView);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="dashboard-main">
        <header className="header-top">
          <div className="greeting">
            <h1>Workspace</h1>
            <p className="text-muted">Welcome back, Agent. Here's what's happening.</p>
          </div>
          <AgentStatus />
        </header>

        <Analytics />

        <div className="workspace-grid">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="view-container"
            >
              {activeView === "dialer" && (
                <div className="dialer-layout">
                  <Dialer />
                </div>
              )}
              {(activeView === "leads" || activeView === "overview") && <LeadPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CRMPanel />
    </div>
  );
}
