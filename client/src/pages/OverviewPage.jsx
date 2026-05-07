import Dialer from "../components/Dialer";
import CallPanel from "../components/CallPanel";
import InsightsPage from "./InsightsPage";
import LeadPanel from "../components/LeadPanel";

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <InsightsPage />

      <div className="grid grid-cols-2 gap-6">
        <Dialer />
        <CallPanel />
      </div>

      <LeadPanel />
    </div>
  );
}


