import { Delete, PhoneCall, Wifi, WifiOff, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { useAuthStore } from "../store/useAuthStore";
import { fetchTelecomReadiness } from "../api/api";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export default function Dialer() {
  const dialedNumber = useStore((state) => state.dialedNumber);
  const appendDigit = useStore((state) => state.appendDigit);
  const backspaceDialedNumber = useStore((state) => state.backspaceDialedNumber);
  const setDialedNumber = useStore((state) => state.setDialedNumber);
  const makeRealCall = useStore((state) => state.makeRealCall);
  const sipStatus = useStore((state) => state.sipStatus);
  const twilioStatus = useStore((state) => state.twilioStatus);
  const isCalling = useStore((state) => state.isCalling);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initTelecom = useStore((state) => state.initTelecom);
  const disconnectTelecom = useStore((state) => state.disconnectTelecom);
  const [readiness, setReadiness] = useState(null);

  const voiceStatus =
    twilioStatus === "registered" || twilioStatus === "ready"
      ? twilioStatus
      : sipStatus;
  const isOnline = voiceStatus === "registered" || voiceStatus === "ready";
  
  const canCall =
    dialedNumber.trim().length > 0 &&
    isAuthenticated &&
    !isCalling &&
    isOnline;

  useEffect(() => {
    let mounted = true;

    fetchTelecomReadiness()
      .then((res) => {
        if (!mounted) return;
        setReadiness(res.data);
      })
      .catch(() => {
        if (!mounted) return;
        setReadiness(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const disabledReason = useMemo(() => {
    if (!isAuthenticated) return "Login required before placing calls.";
    if (!dialedNumber.trim()) return "Enter a destination number.";
    if (isCalling) return "Call is already in progress.";
    if (!isOnline) {
      return "Voice is offline. Click status badge to connect.";
    }
    return "";
  }, [dialedNumber, isAuthenticated, isCalling, isOnline]);

  const handleCall = async () => {
    if (!canCall) return;
    try {
      await makeRealCall(dialedNumber);
    } catch {
      // Error is shown via store callError state.
    }
  };

  return (
    <section className="panel dialer-panel border border-white/10 bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-xl shadow-panel">
      {/* Panel Header */}
      <div className="flex w-full items-start justify-between gap-4 mb-5">
        <div>
          <p className="eyebrow text-cyan-300 tracking-[0.2em] text-[10px]">Smart Dialer</p>
          <h2 className="text-xl font-black text-white mt-1">Manual Console</h2>
        </div>
        <button
          type="button"
          onClick={isOnline ? disconnectTelecom : initTelecom}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition duration-200 ${isOnline ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20" : "border-rose-300/30 bg-rose-400/10 text-rose-300 hover:bg-rose-500/25"}`}
          title={isOnline ? "Disconnect Voice" : "Connect Voice"}
        >
          {isOnline ? <Wifi size={12} className="animate-pulse" /> : <WifiOff size={12} />}
          <span>{isOnline ? `Voice: ${voiceStatus}` : "Voice Offline"}</span>
        </button>
      </div>

      {/* Input Display */}
      <div className={`dialer-input rounded-2xl border border-white/10 bg-slate-950/50 p-4 mb-4 transition focus-within:border-cyan-500/50 focus-within:shadow-glow flex items-center justify-between`}>
        <input
          value={dialedNumber}
          placeholder="+91 98765 43210"
          className="w-full bg-transparent text-center text-xl font-bold text-white tracking-widest outline-none"
          onChange={(event) => setDialedNumber(event.target.value.replace(/[^0-9*#+\s]/g, ""))}
        />
        {dialedNumber && (
          <button 
            type="button" 
            onClick={backspaceDialedNumber} 
            className="text-slate-500 hover:text-white transition p-1"
            title="Backspace"
          >
            <Delete size={18} />
          </button>
        )}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {keys.map((key) => (
          <motion.button
            type="button"
            key={key}
            className="h-12 rounded-2xl border border-white/5 bg-white/[0.04] text-lg font-bold text-slate-200 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white transition duration-200"
            onClick={() => appendDigit(key)}
            whileTap={{ scale: 0.93 }}
          >
            {key}
          </motion.button>
        ))}
      </div>

      {/* Action triggers */}
      <div className="flex gap-3">
        <button 
          className="ghost-button flex-1 py-3 rounded-2xl text-xs font-black" 
          type="button" 
          disabled={!dialedNumber}
          onClick={() => setDialedNumber("")}
        >
          Clear
        </button>
        <button 
          className={`primary-button flex-[2] py-3 rounded-2xl text-xs font-black gap-2 ${!canCall ? "opacity-50 cursor-not-allowed" : ""}`} 
          type="button" 
          disabled={!canCall} 
          onClick={handleCall}
        >
          <PhoneCall size={14} />
          {isCalling ? "Calling..." : "Place Outbound"}
        </button>
      </div>

      {/* System Helper copy */}
      {!canCall && disabledReason ? (
        <div className="mt-3 flex items-start gap-2 text-slate-500 text-[11px] leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
          <Info size={14} className="shrink-0 text-slate-400 mt-0.5" />
          <span>{disabledReason}</span>
        </div>
      ) : null}

      {readiness?.ready === false && readiness?.blockers?.length ? (
        <div className="mt-2 text-rose-300 text-[11px] leading-relaxed bg-rose-500/5 border border-rose-500/10 rounded-xl p-2.5">
          <strong>Blocker:</strong> {readiness.blockers[0]}
        </div>
      ) : null}
    </section>
  );
}
