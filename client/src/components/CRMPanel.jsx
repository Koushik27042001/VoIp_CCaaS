import { FiMail, FiCalendar } from "react-icons/fi";
import { useStore } from "../store/useStore";

export default function CRMPanel() {
  const selectedLead = useStore((state) => state.getSelectedLead());
  const activityFeed = useStore((state) => state.activityFeed);

  return (
    <aside className="crm-panel-modern">
      <div className="profile-section">
        {selectedLead ? (
          <>
            <div className="avatar-large">{selectedLead.name?.[0]?.toUpperCase() || "?"}</div>
            <h2>{selectedLead.name}</h2>
            <p className="company">{selectedLead.company}</p>
            
            <div className="info-chips">
              <span className={`pill-status ${selectedLead.priority?.toLowerCase() || "warm"}`}>
                {selectedLead.priority}
              </span>
              <div className="contact-info">
                <FiMail size={14} /> 
                <span>{selectedLead.email || "No email"}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">Select a lead to view context</div>
        )}
      </div>

      <div className="timeline-section">
        <h4 className="section-title">Recent Activity</h4>
        <div className="timeline-container">
          {activityFeed && activityFeed.length > 0 ? (
            activityFeed.map((item) => (
              <div className="timeline-entry" key={item.id}>
                <div className="dot" />
                <div className="content">
                  <p className="activity-text">{item.text}</p>
                  <span className="activity-time">{item.time}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No activity yet</p>
          )}
        </div>
      </div>
    </aside>
  );
}
