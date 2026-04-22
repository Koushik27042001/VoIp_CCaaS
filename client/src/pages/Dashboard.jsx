import { AnimatePresence, motion } from "framer-motion";
import AgentStatus from "../components/AgentStatus";
import Analytics from "../components/Analytics";
import CallPanel from "../components/CallPanel";
import CRMPanel from "../components/CRMPanel";
import Dialer from "../components/Dialer";
import LeadPanel from "../components/LeadPanel";
import Sidebar from "../components/Sidebar";
import { useStore } from "../store/useStore";

export default function Dashboard() {
  const activeView = useStore((state) => state.activeView);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="dashboard-main">
        <header className="hero-strip">
          <div>
            <p className="eyebrow">VoIP Command Center</p>
            <h1>High-velocity calling, lead ops, and CRM sync in one workspace.</h1>
          </div>
          <div className="hero-badges">
            <span className="pill neutral">Realtime analytics</span>
            <span className="pill success">Production-ready UI</span>
          </div>
          
        </header>

        <Analytics />
        <AgentStatus />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28 }}
            className="workspace-grid"
          >
            <div className="workspace-column">
              <Dialer />
              <CallPanel />
            </div>
            <LeadPanel />
          </motion.div>
        </AnimatePresence>
      </main>

      <CRMPanel />
    </div>
  );
}
