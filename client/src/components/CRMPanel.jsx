import { Mail, PhoneIncoming, Sparkles, StickyNote } from "lucide-react";
import { useStore } from "../store/useStore";

const activityIcons = {
  call: PhoneIncoming,
  note: StickyNote,
  status: Sparkles,
};

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function CRMPanel() {
  const selectedLead = useStore((state) => state.getSelectedLead());
  const activityFeed = useStore((state) => state.activityFeed);
  const backendOnline = useStore((state) => state.backendOnline);

  return (
    <aside className="crm-panel">
      <section className="panel context-panel">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">CRM Sync</p>
            <h2>Customer Context</h2>
          </div>
          <span className="pill live">Live</span>
        </div>

        {selectedLead ? (
          <div className="context-card">
            <div className="lead-person compact">
              <div className="avatar accent">{initials(selectedLead.name)}</div>
              <div>
                <h3>{selectedLead.name}</h3>
                <p>{selectedLead.company}</p>
              </div>
            </div>
            <p className="crm-mail">
              <Mail size={13} />
              {selectedLead.email || "No email"}
            </p>
            <div className="score-card">
              <span>Focus Score</span>
              <strong>{selectedLead.priority === "Hot" ? 92 : selectedLead.priority === "Warm" ? 74 : 48}</strong>
            </div>
          </div>
        ) : (
          <p className="muted-copy center-copy">
            {backendOnline === false
              ? "Backend offline. Customer context unavailable until the server starts."
              : "Select a lead to view context."
            }
          </p>
        )}
      </section>

      <section className="panel timeline-panel">
        <p className="eyebrow">Recent Activity</p>
        <div className="timeline-list">
          {activityFeed.map((item) => {
            const Icon = activityIcons[item.type] || Sparkles;
            return (
              <div className="timeline-item" key={item.id}>
                <div className="timeline-icon"><Icon size={13} /></div>
                <div>
                  <p>{item.text}</p>
                  <span>{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
