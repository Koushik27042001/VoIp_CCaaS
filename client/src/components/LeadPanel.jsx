import { CalendarClock, CheckCircle2, FilePlus2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";

const statuses = [
  { label: "Contacted", className: "info" },
  { label: "Interested", className: "warning" },
  { label: "Closed", className: "success" },
];

export default function LeadPanel() {
  const leads = useStore((state) => state.leads);
  const selectedLead = useStore((state) => state.getSelectedLead());
  const selectLead = useStore((state) => state.selectLead);
  const updateLeadStatus = useStore((state) => state.updateLeadStatus);
  const addLeadNote = useStore((state) => state.addLeadNote);
  const startCall = useStore((state) => state.startCall);
  const [noteDraft, setNoteDraft] = useState("");

  const groupedSummary = useMemo(() => {
    return leads.reduce(
      (accumulator, lead) => {
        accumulator.total += 1;
        if (lead.priority === "Hot") accumulator.hot += 1;
        if (lead.status === "Closed") accumulator.closed += 1;
        return accumulator;
      },
      { total: 0, hot: 0, closed: 0 },
    );
  }, [leads]);

  const saveNote = () => {
    if (!selectedLead || !noteDraft.trim()) return;
    addLeadNote(selectedLead.id, noteDraft.trim());
    setNoteDraft("");
  };

  return (
    <section className="panel lead-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h2>Lead workspace</h2>
        </div>
        <div className="lead-summary">
          <span>{groupedSummary.total} leads</span>
          <span>{groupedSummary.hot} hot</span>
          <span>{groupedSummary.closed} closed</span>
        </div>
      </div>

      <div className="lead-layout">
        <div className="lead-list">
          {leads.map((lead) => (
            <motion.button
              layout
              whileHover={{ x: 4 }}
              key={lead.id}
              type="button"
              className={`lead-card ${selectedLead?.id === lead.id ? "selected" : ""}`}
              onClick={() => selectLead(lead.id)}
            >
              <div>
                <strong>{lead.name}</strong>
                <p>{lead.company}</p>
              </div>
              <div className="lead-card-meta">
                <span className={`pill ${lead.priority.toLowerCase()}`}>{lead.priority}</span>
                <span className="muted-copy">{lead.lastTouch}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="lead-detail">
          {selectedLead ? (
            <>
              <div className="lead-headline">
                <div>
                  <h3>{selectedLead.name}</h3>
                  <p>{selectedLead.company}</p>
                </div>
                <span className={`pill ${selectedLead.priority.toLowerCase()}`}>{selectedLead.status}</span>
              </div>

              <div className="detail-grid">
                <div>
                  <span className="label">Phone</span>
                  <strong>{selectedLead.phone}</strong>
                </div>
                <div>
                  <span className="label">Email</span>
                  <strong>{selectedLead.email}</strong>
                </div>
              </div>

              <div className="status-actions">
                {statuses.map((status) => (
                  <button
                    key={status.label}
                    type="button"
                    className={`status-button ${status.className}`}
                    onClick={() => updateLeadStatus(selectedLead.id, status.label)}
                  >
                    <CheckCircle2 size={16} />
                    {status.label}
                  </button>
                ))}
              </div>

              <div className="action-row">
                <button type="button" className="primary-button" onClick={() => startCall({ leadId: selectedLead.id })}>
                  <Phone size={16} />
                  Call Lead
                </button>
                <button type="button" className="ghost-button">
                  <CalendarClock size={16} />
                  Schedule
                </button>
              </div>

              <div className="notes-box">
                <div className="notes-header">
                  <h4>Notes</h4>
                  <FilePlus2 size={16} />
                </div>
                <div className="note-composer">
                  <textarea
                    value={noteDraft}
                    placeholder="Capture objections, pricing signals, or follow-up context..."
                    onChange={(event) => setNoteDraft(event.target.value)}
                  />
                  <button type="button" className="ghost-button" onClick={saveNote}>
                    Add Note
                  </button>
                </div>
                <div className="notes-list">
                  {selectedLead.notes.map((note, index) => (
                    <div key={`${selectedLead.id}-${index}`} className="note-item">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="muted-copy">Select a lead to see details.</p>
          )}
        </div>
      </div>
    </section>
  );
}
