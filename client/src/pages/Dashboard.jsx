import AgentStatus from "../components/AgentStatus";
import Analytics from "../components/Analytics";
import CallPanel from "../components/CallPanel";
import CRMPanel from "../components/CRMPanel";
import Dialer from "../components/Dialer";
import LeadPanel from "../components/LeadPanel";
import Sidebar from "../components/Sidebar";
import SIPTrunkPage from "./settings/SIPTrunkPage";
import { useStore } from "../store/useStore";

export default function Dashboard() {
  const activeView = useStore((state) => state.activeView);
  const isSettingsView = activeView === "sip-trunks";

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="dashboard-main">
        {/* Scrollable area starts here */}
        <div className="main-scroll-container">
          <header className="topbar">
            <div>
              
              <p className="eyebrow">VOIP COMMAND CENTER</p>
              <h1>High-velocity calling, lead ops and CRM sync</h1>
            </div>
            <div className="topbar-actions">
              <button className="soft-badge">Realtime Analytics</button>
              <button className="soft-badge success">Production Ready</button>
            </div>
          </header>

          {isSettingsView ? (
            <SIPTrunkPage />
          ) : (
            <>
              <section className="dashboard-top-section">
                <Analytics />
              </section>

              <AgentStatus />

              <section className="workspace">
                <div className="dialer-stack">
                  <Dialer />
                  <CallPanel />
                </div>
                <LeadPanel />
                <CRMPanel />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
