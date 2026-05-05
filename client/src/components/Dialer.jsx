import { Delete, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "../store/useStore";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export default function Dialer() {
  const dialedNumber = useStore((state) => state.dialedNumber);
  const appendDigit = useStore((state) => state.appendDigit);
  const backspaceDialedNumber = useStore((state) => state.backspaceDialedNumber);
  const setDialedNumber = useStore((state) => state.setDialedNumber);
  const startCall = useStore((state) => state.startCall);
  const makeRealCall = useStore((state) => state.makeRealCall);
  const [isCalling, setIsCalling] = useState(false);

  const canCall = dialedNumber.trim().length > 0 && !isCalling;

  const handleCall = async () => {
    if (!canCall) return;

    setIsCalling(true);
    try {
      await makeRealCall(dialedNumber);
    } catch {
      startCall({ number: dialedNumber });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <section className="panel dialer-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Smart Dialer</p>
          <h2>New Conversation</h2>
        </div>
        <span className="pill ai">AI Ready</span>
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
    </section>
  );
}
