import { Delete, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";

const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export default function Dialer() {
  const dialedNumber = useStore((state) => state.dialedNumber);
  const appendDigit = useStore((state) => state.appendDigit);
  const backspaceDialedNumber = useStore((state) => state.backspaceDialedNumber);
  const setDialedNumber = useStore((state) => state.setDialedNumber);
  const startCall = useStore((state) => state.startCall);

  const canCall = dialedNumber.trim().length > 0;

  return (
    <section className="panel dialer-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Smart Dialer</p>
          <h2>Start a new conversation</h2>
        </div>
        <span className="pill success">AI-ready</span>
      </div>

      <input
        className="dialer-input"
        value={dialedNumber}
        placeholder="+91 98765 43210"
        onChange={(event) => setDialedNumber(event.target.value)}
      />

      <div className="keypad-grid">
        {keypad.map((key) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={key}
            type="button"
            className="keypad-button"
            onClick={() => appendDigit(key)}
          >
            {key}
          </motion.button>
        ))}
      </div>

      <div className="dialer-actions">
        <button type="button" className="ghost-button" onClick={backspaceDialedNumber}>
          <Delete size={16} />
          Delete
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={!canCall}
          onClick={() => startCall({ number: dialedNumber })}
        >
          <PhoneCall size={18} />
          Place Call
        </button>
      </div>
    </section>
  );
}
