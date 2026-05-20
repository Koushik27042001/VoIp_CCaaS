import { useEffect, useState } from "react";
import { fetchCallHistory } from "../../api/api";
import AgentLayout from "../../layouts/AgentLayout";

export default function CallHistoryPage() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    fetchCallHistory()
      .then((res) => setCalls(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <AgentLayout>
      <div className="space-y-6">
        <div>
          <p className="eyebrow">Call Ledger</p>
          <h1 className="mt-2 text-4xl font-black">Call History</h1>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-panel">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Disposition</th>
                <th className="p-4">Started</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr className="border-t border-white/10" key={call._id || call.callId}>
                  <td className="p-4 font-bold text-white">{call.phone}</td>
                  <td className="p-4 capitalize text-slate-300">{call.status}</td>
                  <td className="p-4 capitalize text-slate-300">{call.disposition || "pending"}</td>
                  <td className="p-4 text-slate-400">{call.startTime ? new Date(call.startTime).toLocaleString() : "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AgentLayout>
  );
}
