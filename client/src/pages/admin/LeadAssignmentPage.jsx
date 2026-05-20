import { useEffect, useMemo, useState } from "react";
import {
  assignLead,
  fetchAgents,
  fetchLeadAssignments,
  fetchLeads,
} from "../../api/api";
import AdminLayout from "../../layouts/AdminLayout";

export default function LeadAssignmentPage() {
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    const [agentRes, leadRes, assignmentRes] = await Promise.all([
      fetchAgents(),
      fetchLeads(),
      fetchLeadAssignments(),
    ]);
    setAgents((agentRes.data.users || []).filter((user) => user.role === "agent"));
    setLeads(leadRes.data.leads || []);
    setAssignments(assignmentRes.data.assignments || []);
  };

  useEffect(() => {
    loadData().catch(() => setError("Unable to load assignment data"));
  }, []);

  const assignedLeadIds = useMemo(
    () => new Set(assignments.map((assignment) => assignment.customerId?._id || assignment.customerId)),
    [assignments]
  );

  const unassignedLeads = useMemo(
    () => leads.filter((lead) => !assignedLeadIds.has(lead._id)),
    [assignedLeadIds, leads]
  );

  const handleAssign = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await assignLead({ customerId: selectedLead, assignedTo: selectedAgent });
      setSelectedLead("");
      setSelectedAgent("");
      setMessage("Lead assigned successfully.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign lead");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-r from-violet-500/15 to-cyan-400/15 p-6 shadow-panel">
          <p className="eyebrow">Lead Routing</p>
          <h1 className="mt-2 text-4xl font-black">Assign leads to agents</h1>
          <p className="mt-2 text-slate-300">Keep every lead owned, visible, and ready for action.</p>
        </section>

        <form className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-5 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleAssign}>
          <label className="auth-field block">
            <span>Lead</span>
            <select value={selectedLead} required onChange={(event) => setSelectedLead(event.target.value)}>
              <option value="">Select lead</option>
              {unassignedLeads.map((lead) => (
                <option key={lead._id} value={lead._id}>{lead.name} - {lead.phone}</option>
              ))}
            </select>
          </label>
          <label className="auth-field block">
            <span>Agent</span>
            <select value={selectedAgent} required onChange={(event) => setSelectedAgent(event.target.value)}>
              <option value="">Select agent</option>
              {agents.map((agent) => (
                <option key={agent.id || agent._id} value={agent.id || agent._id}>{agent.name}</option>
              ))}
            </select>
          </label>
          <button className="primary-button self-end" type="submit">Assign</button>
        </form>

        {message ? <div className="auth-success">{message}</div> : null}
        {error ? <div className="auth-error">{error}</div> : null}

        <section className="grid gap-4">
          {assignments.map((assignment) => (
            <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40" key={assignment._id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{assignment.customerId?.name || "Lead"}</h2>
                  <p className="text-slate-400">{assignment.customerId?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Assigned to</p>
                  <strong>{assignment.assignedTo?.name || "Unknown agent"}</strong>
                </div>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold capitalize text-cyan-100">
                  {assignment.status}
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
}
