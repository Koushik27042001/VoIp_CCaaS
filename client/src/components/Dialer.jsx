import { motion } from "framer-motion";
import { FiDelete, FiPhoneCall } from "react-icons/fi";
import { useStore } from "../store/useStore";
import { useState } from "react";

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
    } catch (error) {
      console.error("Call failed:", error);
      startCall({ number: dialedNumber });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="panel dialer-modern">
      <div className="dialer-header">
        <p className="eyebrow">Outbound</p>
        <h2>Smart Dialer</h2>
      </div>

      <div className="display-area">
        <input
          type="text"
          value={dialedNumber}
          onChange={(e) => setDialedNumber(e.target.value)}
          placeholder="Enter number..."
        />

        {dialedNumber && (
          <button
            type="button"
            onClick={backspaceDialedNumber}
            className="backspace"
          >
            <FiDelete size={18} />
          </button>
        )}
      </div>

      <div className="keypad">
        {keys.map((k) => (
          <motion.button
            key={k}
            type="button"
            className="key"
            whileTap={{ scale: 0.9 }}
            onClick={() => appendDigit(k)}
          >
            {k}
          </motion.button>
        ))}
      </div>

      <button
        type="button"
        className="call-trigger"
        onClick={handleCall}
        disabled={!canCall}
      >
        <FiPhoneCall size={18} />
        {isCalling ? "Calling..." : "Place Call"}
      </button>
    </div>
  );
}
