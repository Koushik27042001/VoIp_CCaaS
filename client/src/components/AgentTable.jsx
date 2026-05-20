export default function AgentTable({ agents = [] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-panel">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr className="border-t border-white/10 transition hover:bg-cyan-300/5" key={agent.id || agent._id}>
              <td className="p-4 font-bold text-white">{agent.name}</td>
              <td className="p-4 text-slate-300">{agent.email}</td>
              <td className="p-4 capitalize text-slate-300">{agent.role}</td>
              <td className="p-4">
                <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold capitalize text-emerald-200">
                  {agent.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
