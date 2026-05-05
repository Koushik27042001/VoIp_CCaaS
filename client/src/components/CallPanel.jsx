import { Mic, MicOff, Pause, Phone, PhoneOff, Play, Volume2 } from "lucide-react";
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

    const id = window.setInterval(() => setDuration(getActiveCallDuration()), 1000);
    return () => window.clearInterval(id);
  }, [activeCall, getActiveCallDuration]);

  if (!activeCall) {
    return (
      <section className="panel empty-call-state">
        <div className="avatar muted lg">
          <Phone size={20} />
        </div>
        <h3>No active call</h3>
        <p className="muted-copy">Pick a lead or dial to begin a conversation.</p>
      </section>
    );
  }

  return (
    <section className="panel call-panel">
      <div className="live-bar" />
      <div className="call-head">
        <div>
          <p className="eyebrow live">Live Call</p>
          <h2>{activeCall.name}</h2>
          <p>{activeCall.company}</p>
        </div>
        <div className="call-time">
          <strong>{duration}</strong>
          <span>{activeCall.number}</span>
        </div>
      </div>

      <div className={`waveform ${activeCall.muted || activeCall.onHold ? "quiet" : ""}`}>
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} style={{ "--i": index }} />
        ))}
      </div>

      <div className="call-meta">
        <div>
          <span className="label">Status</span>
          <strong>{activeCall.onHold ? "On hold" : "Connected"}</strong>
        </div>
        <div>
          <span className="label">Microphone</span>
          <strong>{activeCall.muted ? "Muted" : "Active"}</strong>
        </div>
      </div>

      <div className="control-row">
        <button className={`control-button ${activeCall.muted ? "active" : ""}`} type="button" onClick={toggleMute}>
          {activeCall.muted ? <MicOff size={15} /> : <Mic size={15} />}
          {activeCall.muted ? "Unmute" : "Mute"}
        </button>
        <button className={`control-button ${activeCall.onHold ? "active" : ""}`} type="button" onClick={toggleHold}>
          {activeCall.onHold ? <Play size={15} /> : <Pause size={15} />}
          {activeCall.onHold ? "Resume" : "Hold"}
        </button>
        <button className="control-button" type="button">
          <Volume2 size={15} />
          Monitor
        </button>
        <button className="danger-button" type="button" onClick={endCall}>
          <PhoneOff size={15} />
          End
        </button>
      </div>
    </section>
  );
}
