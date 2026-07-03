import { useEffect } from "react";
import AgentStatus from "../../components/AgentStatus";
import Analytics from "../../components/Analytics";
import CallPanel from "../../components/CallPanel";
import CRMPanel from "../../components/CRMPanel";
import Dialer from "../../components/Dialer";
import LeadPanel from "../../components/LeadPanel";
import AgentLayout from "../../layouts/AgentLayout";
import { useStore } from "../../store/useStore";

const STYLES = `
  .ad-root {
    --orange: #F97316;
    --surface: #0F172A;
    --surface-2: #1E293B;
    --border: rgba(255,255,255,0.08);
    --text-primary: #F8FAFC;
    --text-muted: #94A3B8;
    --radius-lg: 20px;
    --radius-md: 14px;

    width: 100%;
    color: var(--text-primary);
    font-family: Inter, "DM Sans", system-ui, sans-serif;
  }

  .ad-inner {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding-bottom: 32px;
  }

  .ad-hero {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    background: linear-gradient(
      135deg,
      rgba(16,185,129,.12) 0%,
      rgba(6,182,212,.08) 40%,
      rgba(124,58,237,.10) 100%
    );
    padding: 28px 32px;
    position: relative;
    overflow: hidden;
  }

  .ad-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--orange);
    background: rgba(249,115,22,.12);
    border: 1px solid rgba(249,115,22,.25);
    padding: 4px 12px;
    border-radius: 50px;
    margin-bottom: 14px;
  }

  .ad-hero h1 {
    font-size: clamp(1.5rem, 2.8vw, 2.2rem);
    font-weight: 800;
    letter-spacing: -.02em;
    margin: 0 0 10px;
    line-height: 1.15;
  }

  .ad-hero p {
    font-size: 14.5px;
    color: var(--text-muted);
    max-width: 640px;
    line-height: 1.7;
    margin: 0;
  }

  .ad-analytics-wrap,
  .ad-status-wrap,
  .ad-panel {
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    background: var(--surface-2);
    overflow: visible;
  }

  .ad-status-wrap {
    border-left: 3px solid var(--orange);
  }

  .ad-workspace {
    display: grid;
    grid-template-columns: minmax(300px, 340px) minmax(0, 1fr) minmax(280px, 320px);
    grid-template-areas: "dialer leads crm";
    gap: 16px;
    align-items: start;
  }

  @media (max-width: 1280px) {
    .ad-workspace {
      grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
      grid-template-areas:
        "dialer leads"
        "dialer crm";
    }
  }

  @media (max-width: 900px) {
    .ad-workspace {
      grid-template-columns: 1fr;
      grid-template-areas:
        "dialer"
        "leads"
        "crm";
    }
  }

  .ad-dialer-col {
    grid-area: dialer;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ad-panel-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 16px 18px 0;
  }

  .ad-panel .panel,
  .ad-panel .lead-panel,
  .ad-panel .crm-panel {
    border: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
  }

  .ad-panel .dialer-panel,
  .ad-panel .call-panel,
  .ad-panel .empty-call-state {
    min-height: auto;
  }
`;

function StyleTag() {
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "agent-dashboard-styles";
    el.textContent = STYLES;
    if (!document.getElementById("agent-dashboard-styles")) {
      document.head.appendChild(el);
    }
    return () => el.remove();
  }, []);
  return null;
}

export default function AgentDashboard() {
  const initTelecom = useStore((state) => state.initTelecom);
  const disconnectTelecom = useStore((state) => state.disconnectTelecom);

  useEffect(() => {
    initTelecom();
    return () => {
      disconnectTelecom();
    };
  }, [initTelecom, disconnectTelecom]);

  return (
    <AgentLayout>
      <StyleTag />

      <div className="ad-root">
        <div className="ad-inner">
          <section className="ad-hero">
            <div className="ad-eyebrow">Agent Workspace</div>
            <h1>Always-on calling &amp; CRM console</h1>
            <p>
              Use this workspace for CRM-synced leads and manual calling from Excel sheets.
              Dialer, analytics, live call controls, and recent activity stay visible at all times.
            </p>
          </section>

          <section className="ad-analytics-wrap">
            <Analytics />
          </section>

          <div className="ad-status-wrap">
            <AgentStatus />
          </div>

          <section className="ad-workspace">
            <div className="ad-dialer-col">
              <div className="ad-panel">
                <p className="ad-panel-label">Dialer</p>
                <Dialer />
              </div>
              <div className="ad-panel">
                <p className="ad-panel-label">Live call</p>
                <CallPanel />
              </div>
            </div>

            <div className="ad-panel" style={{ gridArea: "leads" }}>
              <p className="ad-panel-label">Leads</p>
              <LeadPanel />
            </div>

            <div className="ad-panel" style={{ gridArea: "crm" }}>
              <p className="ad-panel-label">CRM</p>
              <CRMPanel />
            </div>
          </section>
        </div>
      </div>
    </AgentLayout>
  );
}
