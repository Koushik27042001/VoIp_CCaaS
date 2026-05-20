import { useEffect, useMemo, useState } from "react";
import { fetchCallHistory, fetchMyLeads } from "../../api/api";
import StatCard from "../../components/StatCard";
import AgentLayout from "../../layouts/AgentLayout";

export default function AgentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    Promise.all([fetchMyLeads(), fetchCallHistory()])
      .then(([leadRes, callRes]) => {
        setAssignments(leadRes.data.assignments || []);
        setCalls(callRes.data || []);
      })
      .catch(() => {});
  }, []);

  const interested = useMemo(
    () => assignments.filter((assignment) => assignment.status === "interested").length,
    [assignments]
  );

  return (
    <AgentLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-emerald-400/15 via-cyan-500/10 to-violet-500/10 p-6 shadow-panel">
          <p className="eyebrow">Agent Workspace</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Focus queue for today</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Your assigned leads, call outcomes, notes, and follow-up state stay in one live lane.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Assigned Leads" value={assignments.length} />
          <StatCard title="Calls Logged" value={calls.length} accent="from-violet-400 to-fuchsia-500" />
          <StatCard title="Interested" value={interested} accent="from-emerald-400 to-cyan-500" />
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          {assignments.slice(0, 4).map((assignment) => (
            <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40" key={assignment._id}>
              <p className="eyebrow">Next Lead</p>
              <h2 className="mt-2 text-2xl font-black">{assignment.customerId?.name}</h2>
              <p className="text-slate-400">{assignment.customerId?.company || assignment.customerId?.phone}</p>
            </article>
          ))}
        </section>
      </div>
    </AgentLayout>
  );
}
