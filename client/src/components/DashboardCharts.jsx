import React, { useMemo } from "react";
import { PieChart, Users, TrendingUp } from "lucide-react";

export default function DashboardCharts({ agents = [], leads = [], assignments = [] }) {
  // 1. Agent Status Analysis
  const agentStats = useMemo(() => {
    let available = 0;
    let onCall = 0;
    let onBreak = 0;
    let offline = 0;

    agents.forEach((a) => {
      const status = (a.status || "").toLowerCase();
      if (status === "available" || status === "online") available++;
      else if (status === "on_call" || status === "on-call" || status === "busy") onCall++;
      else if (status === "break" || status === "away") onBreak++;
      else offline++;
    });

    const total = available + onCall + onBreak + offline;

    return {
      total,
      data: [
        { label: "Available", value: available, color: "#10B981", className: "bg-emerald-500" },
        { label: "On Call", value: onCall, color: "#8B5CF6", className: "bg-violet-500" },
        { label: "Break", value: onBreak, color: "#F59E0B", className: "bg-amber-500" },
        { label: "Offline", value: offline, color: "#64748B", className: "bg-slate-500" },
      ].filter(item => item.value > 0 || total === 0)
    };
  }, [agents]);

  // 2. Lead Status Analysis
  const leadStats = useMemo(() => {
    let newLeads = 0;
    let contacted = 0;
    let converted = 0;
    let lost = 0;

    leads.forEach((l) => {
      const status = (l.status || "").toLowerCase();
      if (status === "new") newLeads++;
      else if (status === "contacted" || status === "in_progress" || status === "in-progress" || status === "interested") contacted++;
      else if (status === "converted" || status === "closed" || status === "completed") converted++;
      else if (status === "lost") lost++;
      else newLeads++; // default fallback
    });

    const total = leads.length;

    return {
      total,
      newLeads,
      contacted,
      converted,
      lost,
      data: [
        { label: "New", value: newLeads, color: "#0EA5E9", className: "bg-sky-500" },
        { label: "Contacted", value: contacted, color: "#EC4899", className: "bg-pink-500" },
        { label: "Converted", value: converted, color: "#10B981", className: "bg-emerald-500" },
        { label: "Lost", value: lost, color: "#EF4444", className: "bg-rose-500" },
      ]
    };
  }, [leads]);

  // 3. Render Donut Chart Helper
  const renderDonut = (title, stats, icon) => {
    const total = stats.total;
    const radius = 36;
    const circumference = 2 * Math.PI * radius; // ~226.19
    let currentOffset = 0;

    // Default if total is 0 to show empty grey donut
    const chartData = total === 0 
      ? [{ label: "No Data", value: 1, color: "rgba(255,255,255,0.08)" }]
      : stats.data;

    const chartTotal = total === 0 ? 1 : total;

    return (
      <div className="relative flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel backdrop-blur-xl transition duration-300 hover:border-cyan-500/30">
        <div className="flex w-full items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">{title}</h3>
          </div>
          <span className="soft-badge">{total} Total</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-around py-2">
          {/* SVG Pie/Donut Chart */}
          <div className="relative h-32 w-32 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="10"
              />
              {chartData.map((item, idx) => {
                const percentage = (item.value / chartTotal) * 100;
                const strokeLength = (percentage / 100) * circumference;
                const strokeOffset = circumference - currentOffset;
                currentOffset += strokeLength;

                return (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="10"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    className="transition-all duration-500 ease-out"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{total}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">active</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[120px]">
            {chartData.map((item, idx) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-bold text-white">
                    {total > 0 ? `${item.value} (${pct}%)` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Stacked Progress percentages
  const leadTotal = leadStats.total;
  const newPct = leadTotal > 0 ? (leadStats.newLeads / leadTotal) * 100 : 0;
  const contactedPct = leadTotal > 0 ? (leadStats.contacted / leadTotal) * 100 : 0;
  const convertedPct = leadTotal > 0 ? (leadStats.converted / leadTotal) * 100 : 0;
  const lostPct = leadTotal > 0 ? (leadStats.lost / leadTotal) * 100 : 0;

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
      {/* Agent status pie chart */}
      <div className="lg:col-span-5 h-full">
        {renderDonut("Agent Status Distribution", agentStats, <Users size={16} className="text-violet-400" />)}
      </div>

      {/* Lead Status / Floor conversion stats bar */}
      <div className="lg:col-span-7 flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-panel backdrop-blur-xl transition duration-300 hover:border-cyan-500/30">
        <div className="flex w-full items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Floor Velocity &amp; Lead Status</h3>
          </div>
          <span className="soft-badge success">Live Sync</span>
        </div>

        <div className="space-y-4 my-2">
          {/* Stacked Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2 text-xs font-bold">
              <span className="text-slate-300">Lead Pipeline Breakdown</span>
              <span className="text-emerald-400">{leadTotal > 0 ? Math.round((leadStats.converted / leadTotal) * 100) : 0}% Converted</span>
            </div>
            
            <div className="flex h-5 w-full overflow-hidden rounded-xl bg-slate-950/50 border border-white/10 p-0.5">
              {leadStats.newLeads > 0 && (
                <div 
                  style={{ width: `${newPct}%` }} 
                  className="h-full rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500 shadow-inner" 
                  title={`New: ${leadStats.newLeads}`}
                />
              )}
              {leadStats.contacted > 0 && (
                <div 
                  style={{ width: `${contactedPct}%` }} 
                  className="h-full rounded-lg bg-gradient-to-r from-pink-400 to-fuchsia-500 transition-all duration-500" 
                  title={`Contacted: ${leadStats.contacted}`}
                />
              )}
              {leadStats.converted > 0 && (
                <div 
                  style={{ width: `${convertedPct}%` }} 
                  className="h-full rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500" 
                  title={`Converted: ${leadStats.converted}`}
                />
              )}
              {leadStats.lost > 0 && (
                <div 
                  style={{ width: `${lostPct}%` }} 
                  className="h-full rounded-lg bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-500" 
                  title={`Lost: ${leadStats.lost}`}
                />
              )}
              {leadTotal === 0 && (
                <div className="h-full w-full rounded-lg bg-slate-800 transition-all" />
              )}
            </div>
          </div>

          {/* Detailed Statistics Bar Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">New Leads</span>
              <strong className="block text-xl text-white mt-1">{leadStats.newLeads}</strong>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">Contacted</span>
              <strong className="block text-xl text-white mt-1">{leadStats.contacted}</strong>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Converted</span>
              <strong className="block text-xl text-white mt-1">{leadStats.converted}</strong>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">Lost</span>
              <strong className="block text-xl text-white mt-1">{leadStats.lost}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
