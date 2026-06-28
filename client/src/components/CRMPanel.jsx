import { Mail, PhoneIncoming, Sparkles, StickyNote, Activity, Target } from "lucide-react";
import { useStore } from "../store/useStore";

const activityIcons = {
  call: PhoneIncoming,
  note: StickyNote,
  status: Sparkles,
};

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function CRMPanel() {
  const selectedLead = useStore((state) => state.getSelectedLead());
  const activityFeed = useStore((state) => state.activityFeed);
  const backendOnline = useStore((state) => state.backendOnline);

  const focusScore = selectedLead 
    ? (selectedLead.priority === "Hot" ? 92 : selectedLead.priority === "Warm" ? 74 : 48) 
    : 0;

  return (
    <aside className="crm-panel flex flex-col gap-5">
      {/* Customer Context */}
      <section className="panel context-panel border border-white/10 bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-xl shadow-panel">
        <div className="flex w-full items-center justify-between mb-4 border-b border-white/5 pb-4">
          <div>
            <p className="eyebrow text-cyan-300 tracking-[0.2em] text-[10px]">CRM Sync</p>
            <h2 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">Customer Context</h2>
          </div>
          <span className="soft-badge success">Live</span>
        </div>

        {selectedLead ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 bg-white/[0.02] border border-white/5 rounded-2xl p-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white font-black text-xs flex items-center justify-center shadow-glow shrink-0">
                {initials(selectedLead.name)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{selectedLead.name}</h3>
                <span className="text-[10px] text-slate-400 truncate block mt-0.5">{selectedLead.company}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2.5">
              <Mail size={13} className="text-slate-500 shrink-0" />
              <span className="truncate">{selectedLead.email || "No email synchronized"}</span>
            </div>

            {/* Focus score card */}
            <div className="relative overflow-hidden border border-white/5 bg-gradient-to-br from-violet-500/10 via-cyan-400/5 to-transparent rounded-2xl p-4 flex items-center justify-between">
              <div className="absolute top-0 right-0 p-1 pointer-events-none opacity-20">
                <Target size={32} className="text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-violet-400 tracking-wider">Priority Weight</span>
                <span className="block text-xs text-slate-400 mt-1">Lead engagement score</span>
              </div>
              <div className="text-right">
                <strong className={`text-3xl font-black ${focusScore >= 80 ? "text-orange-400" : focusScore >= 60 ? "text-cyan-400" : "text-slate-400"}`}>
                  {focusScore}
                </strong>
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">points</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-10 text-xs text-slate-500 leading-relaxed">
            <Activity size={24} className="text-slate-600 mb-2.5 animate-pulse" />
            <span>
              {backendOnline === false
                ? "Backend connection offline. Context cache active."
                : "Select a lead to synchronize live customer scores and database notes."}
            </span>
          </div>
        )}
      </section>

      {/* Recent Activity Timeline */}
      <section className="panel timeline-panel border border-white/10 bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-xl shadow-panel">
        <div className="flex w-full items-center justify-between mb-4 border-b border-white/5 pb-4">
          <div>
            <p className="eyebrow text-cyan-300 tracking-[0.2em] text-[10px]">Session logs</p>
            <h2 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">Floor Events</h2>
          </div>
          <span className="soft-badge">Realtime</span>
        </div>

        <div className="space-y-3">
          {activityFeed.length === 0 ? (
            <p className="text-[11px] text-slate-600 text-center py-6">No recent events recorded.</p>
          ) : (
            activityFeed.map((item) => {
              const Icon = activityIcons[item.type] || Sparkles;
              return (
                <div className="flex items-start gap-3 border border-white/5 bg-white/[0.02] rounded-2xl p-3 text-xs text-slate-300 transition duration-200 hover:border-white/10" key={item.id}>
                  <div className="h-7 w-7 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 flex items-center justify-center shrink-0">
                    <Icon size={12} className="shrink-0" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-200 leading-normal truncate">{item.text}</p>
                    <span className="block text-[9px] text-slate-500 mt-1">{item.time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </aside>
  );
}
