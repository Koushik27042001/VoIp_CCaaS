import { useEffect, useState } from "react";
import {
  addLeadAssignmentNote,
  fetchMyLeads,
  placeOutboundCall,
  updateLeadAssignmentStatus,
} from "../../api/api";
import AgentLayout from "../../layouts/AgentLayout";

const statuses = ["new", "contacted", "interested", "closed"];

export default function MyLeadsPage() {
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadLeads = async () => {
    const res = await fetchMyLeads();
    setAssignments(res.data.assignments || []);
  };

  useEffect(() => {
    loadLeads().catch(() => setError("Unable to load assigned leads"));
  }, []);

  const callLead = async (phone) => {
    setMessage("");
    setError("");
    try {
      await placeOutboundCall(phone);
      setMessage(`Calling ${phone}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to place call");
    }
  };

  const updateStatus = async (id, status) => {
    await updateLeadAssignmentStatus(id, status);
    await loadLeads();
  };

  const saveNote = async (id) => {
    const note = notes[id]?.trim();
    if (!note) return;
    await addLeadAssignmentNote(id, note);
    setNotes((current) => ({ ...current, [id]: "" }));
    await loadLeads();
  };

  return (
    <AgentLayout>
      <div className="space-y-6">
        <div>
          <p className="eyebrow">Assigned Pipeline</p>
          <h1 className="mt-2 text-4xl font-black">My Leads</h1>
        </div>

        {message ? <div className="auth-success">{message}</div> : null}
        {error ? <div className="auth-error">{error}</div> : null}

        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const lead = assignment.customerId;
            return (
              <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-panel transition hover:-translate-y-1 hover:border-cyan-300/40" key={assignment._id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Lead</p>
                    <h2 className="mt-2 text-2xl font-black">{lead?.name}</h2>
                    <p className="text-slate-400">{lead?.company || "Unknown company"}</p>
                    <p className="mt-2 font-bold text-cyan-200">{lead?.phone}</p>
                  </div>
                  <button className="primary-button" type="button" onClick={() => callLead(lead?.phone)}>
                    Call Lead
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      className={`ghost-button capitalize ${assignment.status === status ? "border-cyan-300/50 bg-cyan-400/15" : ""}`}
                      key={status}
                      type="button"
                      onClick={() => updateStatus(assignment._id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/35 p-3">
                  <div className="flex gap-3">
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                      placeholder="Add note or follow-up detail..."
                      value={notes[assignment._id] || ""}
                      onChange={(event) => setNotes((current) => ({ ...current, [assignment._id]: event.target.value }))}
                    />
                    <button className="ghost-button" type="button" onClick={() => saveNote(assignment._id)}>Save</button>
                  </div>
                  {assignment.notes?.length ? (
                    <div className="mt-3 grid gap-2">
                      {assignment.notes.map((note) => (
                        <p className="rounded-2xl bg-white/[0.05] p-3 text-sm text-slate-300" key={note._id || note.createdAt}>
                          {note.text}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
          {assignments.length === 0 ? <p className="muted-copy">No leads assigned yet.</p> : null}
        </div>
      </div>
    </AgentLayout>
  );
}
