import { History, Mail, NotebookTabs, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";

const iconMap = {
  call: History,
  note: NotebookTabs,
  status: Sparkles,
};

export default function CRMPanel() {
  const selectedLead = useStore((state) => state.getSelectedLead());
  const activityFeed = useStore((state) => state.activityFeed);

  return (
    <aside className="crm-panel">
      <section className="panel crm-profile">
        <div className="panel-header">
          <div>
            <p className="eyebrow">CRM Sync</p>
            <h2>Customer context</h2>
          </div>
          <span className="pill success">Live</span>
        </div>

        {selectedLead ? (
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <div className="crm-card">
              <h3>{selectedLead.name}</h3>
              <p>{selectedLead.company}</p>
              <div className="crm-contact">
                <Mail size={14} />
                <span>{selectedLead.email}</span>
              </div>
              <div className="crm-tags">
                <span className={`pill ${selectedLead.priority.toLowerCase()}`}>{selectedLead.priority}</span>
                <span className="pill neutral">{selectedLead.status}</span>
              </div>
            </div>
          </motion.div>
        ) : null}
      </section>

      <section className="panel timeline-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>Recent activity</h2>
          </div>
        </div>

        <div className="timeline-list">
          {activityFeed.map((item) => {
            const Icon = iconMap[item.type] ?? Sparkles;

            return (
              <div className="timeline-item" key={item.id}>
                <div className="timeline-icon">
                  <Icon size={16} />
                </div>
                <div>
                  <strong>{item.text}</strong>
                  <p>{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
