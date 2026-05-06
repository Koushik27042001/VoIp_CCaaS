import { CalendarClock, CheckCircle2, FilePlus2, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";

const statuses = ["Contacted", "Interested", "Closed"];

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function LeadPanel() {
  const leads = useStore((state) => state.leads);
  const selectedLead = useStore((state) => state.getSelectedLead());
  const selectLead = useStore((state) => state.selectLead);
  const updateLeadStatus = useStore((state) => state.updateLeadStatus);
  const addLeadNote = useStore((state) => state.addLeadNote);
  const startCall = useStore((state) => state.startCall);
  const makeRealCall = useStore((state) => state.makeRealCall);
  const backendOnline = useStore((state) => state.backendOnline);
  const [noteDraft, setNoteDraft] = useState("");

  const summary = useMemo(
    () =>
      leads.reduce(
        (acc, lead) => ({
          total: acc.total + 1,
          hot: acc.hot + (lead.priority === "Hot" ? 1 : 0),
          closed: acc.closed + (lead.status === "Closed" ? 1 : 0),
        }),
        { total: 0, hot: 0, closed: 0 },
      ),
    [leads],
  );

  const callLead = async () => {
    if (!selectedLead?.phone) return;

    try {
      await makeRealCall(selectedLead.phone);
    } catch {
      startCall({ leadId: selectedLead.id });
    }
  };

  const saveNote = () => {
    if (!noteDraft.trim() || !selectedLead) return;
    addLeadNote(selectedLead.id, noteDraft.trim());
    setNoteDraft("");
  };

  return (
    <section className="lead-panel">
      <div className="lead-panel-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h2>Lead Workspace</h2>
        </div>
        <div className="header-stats">
          <div><strong>{summary.total}</strong><span>Total</span></div>
          <div><strong className="hot">{summary.hot}</strong><span>Hot</span></div>
          <div><strong className="closed">{summary.closed}</strong><span>Closed</span></div>
        </div>
      </div>

      <div className="lead-body">
        <div className="lead-list">
          {leads.length === 0 ? (
            <div className="empty-state muted-copy">
              {backendOnline === false
                ? "Backend offline. No leads available until the server starts."
                : "No leads available yet."
              }
            </div>
          ) : (
            leads.map((lead) => (
              <button
                key={lead.id}
                className={`lead-card ${selectedLead?.id === lead.id ? "selected" : ""}`}
                type="button"
                onClick={() => selectLead(lead.id)}
              >
                <div>
                  <strong>{lead.name}</strong>
                  <p>{lead.company}</p>
                  <span>{lead.lastTouch}</span>
                </div>
                <span className={`pill ${lead.priority?.toLowerCase() || "warm"}`}>{lead.priority}</span>
              </button>
            ))
          )}
        </div>

        <div className="lead-detail">
          {selectedLead ? (
            <>
              <div className="lead-person">
                <div className="avatar accent">{initials(selectedLead.name)}</div>
                <div>
                  <h3>{selectedLead.name}</h3>
                  <p>{selectedLead.company}</p>
                </div>
                <span className={`pill ${selectedLead.priority?.toLowerCase() || "warm"}`}>{selectedLead.priority}</span>
              </div>

              <div className="detail-grid">
                <div>
                  <span className="label">Phone</span>
                  <strong>{selectedLead.phone}</strong>
                </div>
                <div>
                  <span className="label">Email</span>
                  <strong>{selectedLead.email || "No email"}</strong>
                </div>
              </div>

              <div className="status-actions">
                {statuses.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={selectedLead.status === status ? "active" : ""}
                    onClick={() => updateLeadStatus(selectedLead.id, status)}
                  >
                    <CheckCircle2 size={14} />
                    {status}
                  </button>
                ))}
              </div>

              <div className="action-row">
                <button className="primary-button" type="button" onClick={callLead}>
                  <Phone size={15} />
                  Call Lead
                </button>
                <button className="ghost-button" type="button">
                  <CalendarClock size={15} />
                  Schedule
                </button>
              </div>

              <div className="notes-box">
                <div className="notes-header">
                  <h4>Notes</h4>
                  <FilePlus2 size={15} />
                </div>
                <div className="note-composer">
                  <input
                    value={noteDraft}
                    placeholder="Add observation or follow-up..."
                    onChange={(event) => setNoteDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveNote();
                    }}
                  />
                  <button className="ghost-button" type="button" onClick={saveNote}>Save</button>
                </div>
                {selectedLead.notes?.map((note, index) => (
                  <p className="note-item" key={`${selectedLead.id}-${index}`}>{note}</p>
                ))}
              </div>
            </>
          ) : (
            <p className="muted-copy center-copy">
              {backendOnline === false
                ? "Backend offline. Customer details unavailable until the server starts."
                : "Select a lead to view details."
              }
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
