import Dialer from "../components/Dialer";
import CallPanel from "../components/CallPanel";

export default function DialerPage() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Dialer />
      <CallPanel />
    </div>
  );
}

