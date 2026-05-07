import { useStore } from "../store/useStore";

export default function InsightsPage() {
  const analytics = useStore((state) => state.analytics);

  return (
    <div>
      <h1 className="text-3xl mb-6">Insights</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-[#1A1A40] rounded-xl">
          Calls: {analytics.callsHandled}
        </div>

        <div className="p-4 bg-[#1A1A40] rounded-xl">
          Missed: {analytics.missedCalls}
        </div>

        <div className="p-4 bg-[#1A1A40] rounded-xl">
          CSAT: {analytics.csat}
        </div>

        <div className="p-4 bg-[#1A1A40] rounded-xl">
          Conversion: {analytics.conversionRate}%
        </div>
      </div>
    </div>
  );
}

