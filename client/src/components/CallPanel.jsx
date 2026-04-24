import { Mic, Pause, PhoneOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { getSocket } from "../utils/socket";

export default function CallPanel() {
  const activeCall = useStore((state) => state.activeCall);
  const toggleMute = useStore((state) => state.toggleMute);
  const toggleHold = useStore((state) => state.toggleHold);
  const endCall = useStore((state) => state.endCall);
  const startCall = useStore((state) => state.startCall);
  const getActiveCallDuration = useStore((state) => state.getActiveCallDuration);
  const [duration, setDuration] = useState("00:00");
  const [callStatus, setCallStatus] = useState("idle"); // idle, ringing, connected, ended

  // Socket.io listeners for real-time events
  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      console.log("⚠️ Socket not available in CallPanel");
      return;
    }

    console.log("🎧 Setting up socket listeners in CallPanel");

    const handleCallRinging = (data) => {
      console.log("📲 Call ringing:", data);
      setCallStatus("ringing");
    };

    const handleCallConnected = (data) => {
      console.log("✅ Call connected:", data);
      setCallStatus("connected");
    };

    const handleCallEnded = (data) => {
      console.log("❌ Call ended:", data);
      setCallStatus("ended");

      // Auto-reset after showing end state
      setTimeout(() => {
        setCallStatus("idle");
      }, 2000);
    };

    socket.on("call_ringing", handleCallRinging);
    socket.on("call_connected", handleCallConnected);
    socket.on("call_ended", handleCallEnded);

    return () => {
      console.log("🧹 Cleaning up socket listeners in CallPanel");
      socket.off("call_ringing", handleCallRinging);
      socket.off("call_connected", handleCallConnected);
      socket.off("call_ended", handleCallEnded);
    };
  }, []);

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
          <span className={`signal-dot ${callStatus}`} />
          <span>
            {callStatus === "ringing" && "Ringing..."}
            {callStatus === "connected" && duration}
            {callStatus === "ended" && "Call ended"}
            {callStatus === "idle" && duration}
          </span>
        </div>
      </div>

      <div className="call-meta">
        <div>
          <span className="label">Number</span>
          <strong>{activeCall.number}</strong>
        </div>
        <div>
          <span className="label">State</span>
          <strong>
            {callStatus === "ringing" && "Ringing"}
            {callStatus === "connected" && (activeCall.onHold ? "On hold" : "Connected")}
            {callStatus === "ended" && "Ended"}
            {callStatus === "idle" && (activeCall.onHold ? "On hold" : "Connected")}
          </strong>
        </div>
      </div>

      <div className="control-row">
        <button
          type="button"
          className={`control-button ${activeCall.muted ? "active" : ""}`}
          onClick={toggleMute}
          disabled={callStatus === "ringing"}
        >
          <Mic size={18} />
          {activeCall.muted ? "Muted" : "Mute"}
        </button>
        <button
          type="button"
          className={`control-button ${activeCall.onHold ? "active" : ""}`}
          onClick={toggleHold}
          disabled={callStatus === "ringing"}
        >
          <Pause size={18} />
          {activeCall.onHold ? "Resume" : "Hold"}
        </button>
        <button type="button" className="control-button" disabled={callStatus === "ringing"}>
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
