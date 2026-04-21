import { Delete, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useStore } from "../store/useStore";

const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

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
      // Try backend first
      await makeRealCall(dialedNumber);
    } catch (error) {
      console.error("Call failed:", error);
      // Fallback to local call if backend fails
      startCall({ number: dialedNumber });
    } finally {
      setIsCalling(false);
    }
  };

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
        disabled={isCalling}
      />

      <div className="keypad-grid">
        {keypad.map((key) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={key}
            type="button"
            className="keypad-button"
            onClick={() => appendDigit(key)}
            disabled={isCalling}
          >
            {key}
          </motion.button>
        ))}
      </div>

      <div className="dialer-actions">
        <button 
          type="button" 
          className="ghost-button" 
          onClick={backspaceDialedNumber}
          disabled={isCalling}
        >
          <Delete size={16} />
          Delete
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={!canCall}
          onClick={handleCall}
        >
          <PhoneCall size={18} />
          {isCalling ? "Calling..." : "Place Call"}
        </button>
      </div>
    </section>
  );
}
