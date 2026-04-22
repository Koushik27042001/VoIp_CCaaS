import { Mic, Pause, PhoneOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";

export default function CallPanel() {
  const activeCall = useStore((state) => state.activeCall);
  const toggleMute = useStore((state) => state.toggleMute);
  const toggleHold = useStore((state) => state.toggleHold);
  const endCall = useStore((state) => state.endCall);
  const getActiveCallDuration = useStore((state) => state.getActiveCallDuration);
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    if (!activeCall) {
      setDuration("00:00");
      return undefined;
    }

    setDuration(getActiveCallDuration());
    const interval = window.setInterval(() => {
      setDuration(getActiveCallDuration());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeCall, getActiveCallDuration]);

  if (!activeCall) {
    return (
      <section className="panel call-panel empty-state">
        <div className="empty-illustration" />
        <p className="eyebrow">Live Call</p>
        <h2>No active conversation</h2>
        <p className="muted-copy">Pick a lead or use the dialer to begin a call. Your controls and call summary will appear here.</p>
      </section>
    );
  }

  return (
    <motion.section
      className="panel call-panel active"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="panel-header">
        <div>
          <p className="eyebrow">Active Call</p>
          <h2>{activeCall.name}</h2>
          <p className="muted-copy">{activeCall.company}</p>
        </div>

        <div className="call-badge-wrap">
          <span className="signal-dot" />
          <span>{duration}</span>
        </div>
      </div>

      <div className="call-meta">
        <div>
          <span className="label">Number</span>
          <strong>{activeCall.number}</strong>
        </div>
        <div>
          <span className="label">State</span>
          <strong>{activeCall.onHold ? "On hold" : "Connected"}</strong>
        </div>
      </div>

      <div className="control-row">
        <button
          type="button"
          className={`control-button ${activeCall.muted ? "active" : ""}`}
          onClick={toggleMute}
        >
          <Mic size={18} />
          {activeCall.muted ? "Muted" : "Mute"}
        </button>
        <button
          type="button"
          className={`control-button ${activeCall.onHold ? "active" : ""}`}
          onClick={toggleHold}
        >
          <Pause size={18} />
          {activeCall.onHold ? "Resume" : "Hold"}
        </button>
        <button type="button" className="control-button">
          <Volume2 size={18} />
          Monitor
        </button>
        <button type="button" className="danger-button" onClick={endCall}>
          <PhoneOff size={18} />
          End Call
        </button>
      </div>
    </motion.section>
  );
}
