import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StatCard from "../../components/StatCard";
import DashboardCharts from "../../components/DashboardCharts";
import { fetchAgents, fetchLeadAssignments, fetchLeads } from "../../api/api";

export default function AdminDashboard() {
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    Promise.all([fetchAgents(), fetchLeads(), fetchLeadAssignments()])
      .then(([agentRes, leadRes, assignmentRes]) => {
        setAgents(agentRes.data.users || []);
        setLeads(leadRes.data.leads || []);
        setAssignments(assignmentRes.data.assignments || []);
      })
      .catch(() => {});
  }, []);

  const onlineAgents = useMemo(
    () => agents.filter((agent) => agent.status === "available" || agent.status === "on_call").length,
    [agents]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-cyan-400/15 via-violet-500/10 to-fuchsia-500/10 p-6 shadow-panel">
          <p className="eyebrow">Admin Control Center</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Operate the full calling floor</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Create agents, feed the lead engine, assign work, and watch momentum from one cockpit.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Agents Online" value={onlineAgents} />
          <StatCard title="Total Agents" value={agents.length} accent="from-violet-400 to-fuchsia-500" />
          <StatCard title="Leads Loaded" value={leads.length} accent="from-emerald-400 to-cyan-500" />
          <StatCard title="Assignments" value={assignments.length} accent="from-amber-300 to-rose-500" />
        </div>

        {/* Visual Charts section */}
        <section className="mt-6">
          <DashboardCharts agents={agents} leads={leads} assignments={assignments} />
        </section>
      </div>
    </AdminLayout>
  );
}
