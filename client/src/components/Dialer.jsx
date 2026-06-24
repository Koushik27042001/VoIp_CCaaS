import { Delete, PhoneCall } from "lucide-react";
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
  const [readiness, setReadiness] = useState(null);

  const voiceStatus =
    twilioStatus === "registered" || twilioStatus === "ready"
      ? twilioStatus
      : sipStatus;
  const canCall =
    dialedNumber.trim().length > 0 &&
    isAuthenticated &&
    !isCalling &&
    (voiceStatus === "registered" || voiceStatus === "ready");

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
    if (voiceStatus !== "registered" && voiceStatus !== "ready") {
      return "Voice is offline. Check Twilio/Asterisk setup.";
    }
    return "";
  }, [dialedNumber, isAuthenticated, isCalling, voiceStatus]);

  const handleCall = async () => {
    if (!canCall) return;
    try {
      await makeRealCall(dialedNumber);
    } catch {
      // Error is shown via store callError state.
    }
  };

  return (
    <section className="panel dialer-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Smart Dialer</p>
          <h2>New Conversation</h2>
        </div>
        <span className={`pill ${voiceStatus === "registered" || voiceStatus === "ready" ? "ai" : ""}`}>
          Voice {voiceStatus}
        </span>
      </div>

      <label className={`dialer-input ${dialedNumber ? "has-value" : ""}`}>
        <input
          value={dialedNumber}
          placeholder="+91 98765 43210"
          onChange={(event) => setDialedNumber(event.target.value.replace(/[^0-9*#+\s]/g, ""))}
        />
      </label>

      <div className="keypad-grid">
        {keys.map((key) => (
          <motion.button
            type="button"
            key={key}
            className="keypad-button"
            onClick={() => appendDigit(key)}
            whileTap={{ scale: 0.94 }}
          >
            {key}
          </motion.button>
        ))}
      </div>

      <div className="dialer-actions">
        <button className="ghost-button" type="button" onClick={backspaceDialedNumber}>
          <Delete size={15} />
          Delete
        </button>
        <button className="primary-button" type="button" disabled={!canCall} onClick={handleCall}>
          <PhoneCall size={15} />
          {isCalling ? "Calling..." : "Place Call"}
        </button>
      </div>
      {!canCall && disabledReason ? (
        <p className="muted-copy" style={{ marginTop: "10px" }}>{disabledReason}</p>
      ) : null}
      {readiness?.ready === false && readiness?.blockers?.length ? (
        <p className="muted-copy" style={{ marginTop: "6px" }}>
          Readiness blocker: {readiness.blockers[0]}
        </p>
      ) : null}
    </section>
  );
}
