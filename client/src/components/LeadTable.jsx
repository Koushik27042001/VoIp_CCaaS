export default function LeadTable({ leads = [], actions }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-panel">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="p-4">Lead</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Company</th>
            <th className="p-4">Status</th>
            {actions ? <th className="p-4">Action</th> : null}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr className="border-t border-white/10 transition hover:bg-violet-300/5" key={lead._id || lead.id}>
              <td className="p-4">
                <strong className="block text-white">{lead.name}</strong>
                <span className="text-slate-400">{lead.email || "No email"}</span>
              </td>
              <td className="p-4 text-slate-300">{lead.phone}</td>
              <td className="p-4 text-slate-300">{lead.company || "Unknown"}</td>
              <td className="p-4">
                <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold capitalize text-cyan-100">
                  {lead.status}
                </span>
              </td>
              {actions ? <td className="p-4">{actions(lead)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
