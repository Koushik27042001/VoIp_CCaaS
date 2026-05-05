import { Activity, Clock3, PhoneIncoming, PhoneMissed, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useStore } from "../store/useStore";

const metrics = [
  { key: "callsHandled", label: "Calls Handled", trend: "+12%", tone: "up", Icon: PhoneIncoming },
  { key: "missedCalls", label: "Missed", trend: "-2", tone: "down", Icon: PhoneMissed },
  { key: "conversionRate", label: "Conversion", suffix: "%", trend: "+4%", tone: "up", Icon: Activity },
  { key: "avgHandleTime", label: "Avg Handle", trend: "-18s", tone: "up", Icon: Clock3 },
];

function MetricCard({ label, value, trend, icon: Icon, trendColor }) {
  return (
    <article className="metric-card">
      <div className="card-header">
        <div className="icon-box">
          <Icon size={18} />
        </div>
        <span className={`trend-pill ${trendColor}`}>{trend}</span>
      </div>
      <p className="metric-label">{label}</p>
      <h2 className="metric-value">{value}</h2>
    </article>
  );
}

export default function Analytics() {
  const analytics = useStore((state) => state.analytics);
  const loadAnalyticsFromBackend = useStore((state) => state.loadAnalyticsFromBackend);

  useEffect(() => {
    loadAnalyticsFromBackend();
  }, [loadAnalyticsFromBackend]);

  return (
    <section className="analytics-grid">
      {metrics.map(({ key, label, suffix = "", trend, tone, Icon }) => (
        <MetricCard
          key={key}
          label={label}
          value={`${analytics[key] ?? 0}${suffix}`}
          trend={trend}
          trendColor={tone}
          icon={Icon}
        />
      ))}

      <article className="metric-card creative-card">
        <div className="card-header">
          <div className="icon-box">
            <Sparkles size={18} />
          </div>
          <span className="trend-pill ai">AI</span>
        </div>
        <p className="metric-label">Next Best Action</p>
        <h2 className="metric-value action-value">Call hot leads</h2>
      </article>
    </section>
  );
}
