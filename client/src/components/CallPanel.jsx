import { Mic, MicOff, Pause, Phone, PhoneOff, Play, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";

export default function CallPanel() {
  const activeCall = useStore((state) => state.activeCall);
  const callError = useStore((state) => state.callError);
  const isCalling = useStore((state) => state.isCalling);
  const callingNumber = useStore((state) => state.callingNumber);
  const toggleMute = useStore((state) => state.toggleMute);
  const toggleHold = useStore((state) => state.toggleHold);
  const endTelecomCall = useStore((state) => state.endTelecomCall);
  const getActiveCallDuration = useStore((state) => state.getActiveCallDuration);
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    if (!activeCall) {
      setDuration("00:00");
      return undefined;
    }

    const id = window.setInterval(() => setDuration(getActiveCallDuration()), 1000);
    return () => window.clearInterval(id);
  }, [activeCall, getActiveCallDuration]);

  if (!activeCall) {
    return (
      <section className="panel empty-call-state border border-white/10 bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-xl shadow-panel flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-slate-950 border border-white/15 mb-4 group shadow-glow">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-[8px] animate-pulse pointer-events-none" />
          <Phone size={22} className={`text-cyan-400 ${isCalling ? "animate-bounce" : "group-hover:rotate-12 transition duration-300"}`} />
        </div>
        <h3 className="text-lg font-black text-white">{isCalling ? "Dialing..." : "Console Standby"}</h3>
        <p className="text-slate-400 text-xs mt-2 max-w-[240px] leading-relaxed">
          {callError ||
            (isCalling
              ? `Placing outbound trunk call to ${callingNumber || "number"}...`
              : "Select a lead from pipeline, or type a number in the manual console.")}
        </p>
        {callError && (
          <div className="mt-3 text-[10px] font-bold text-rose-400 uppercase tracking-wider border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 rounded-xl">
            Signal: {callError}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="panel call-panel border border-white/10 bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-xl shadow-panel relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 shadow-glow" />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="eyebrow text-emerald-300 tracking-[0.2em] text-[10px] flex items-center gap-1.5 font-black uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            Live Connection
          </p>
          <h2 className="text-xl font-black text-white mt-1.5">{activeCall.name}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{activeCall.company}</p>
        </div>
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl px-4 py-2 text-right">
          <strong className="block text-xl font-black text-cyan-400 tracking-wider font-mono">{duration}</strong>
          <span className="text-[10px] font-bold text-slate-500 tracking-wider">{activeCall.number}</span>
        </div>
      </div>

      {/* Voice Waveform Animation */}
      <div className={`waveform h-16 flex items-center justify-center gap-1.5 rounded-2xl border border-white/5 bg-slate-950/40 px-5 mb-5 ${activeCall.muted || activeCall.onHold ? "quiet opacity-40" : ""}`}>
        {Array.from({ length: 18 }).map((_, index) => (
          <span 
            key={index} 
            style={{ 
              "--i": index,
              animationDelay: `${index * 0.06}s` 
            }} 
            className="w-1 rounded-full bg-gradient-to-t from-cyan-400 via-blue-500 to-violet-500"
          />
        ))}
      </div>

      {/* Connection Meta */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-3">
          <span className="label text-[9px] text-slate-500 uppercase tracking-widest block mb-0.5">SIP status</span>
          <strong className="text-xs text-white">{activeCall.onHold ? "On Hold" : "Connected"}</strong>
        </div>
        <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-3">
          <span className="label text-[9px] text-slate-500 uppercase tracking-widest block mb-0.5">Microphone</span>
          <strong className="text-xs text-white">{activeCall.muted ? "Muted" : "Active"}</strong>
        </div>
      </div>

      {/* Control Actions Row */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
        <button 
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition duration-200 sm:flex-1 ${activeCall.muted ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-500/5"}`} 
          type="button" 
          onClick={toggleMute}
        >
          {activeCall.muted ? <MicOff size={14} /> : <Mic size={14} />}
          <span>{activeCall.muted ? "Unmute" : "Mute"}</span>
        </button>
        <button 
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition duration-200 sm:flex-1 ${activeCall.onHold ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-500/5"}`} 
          type="button" 
          onClick={toggleHold}
        >
          {activeCall.onHold ? <Play size={14} /> : <Pause size={14} />}
          <span>{activeCall.onHold ? "Resume" : "Hold"}</span>
        </button>
        <button 
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-500/5 text-xs font-bold transition duration-200 sm:flex-1" 
          type="button"
        >
          <Volume2 size={14} />
          <span>Monitor</span>
        </button>
        <button 
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition duration-200 w-full sm:w-auto" 
          type="button" 
          onClick={endTelecomCall}
        >
          <PhoneOff size={14} />
          <span>End Call</span>
        </button>
      </div>
    </section>
  );
}
