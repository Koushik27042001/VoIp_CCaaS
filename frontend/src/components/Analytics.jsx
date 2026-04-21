import { motion } from "framer-motion";
import { useEffect } from "react";
import { Activity, PhoneIncoming, PhoneMissed, Star } from "lucide-react";
import { useStore } from "../store/useStore";

const cardMap = [
  { key: "callsHandled", label: "Calls handled", icon: PhoneIncoming, suffix: "" },
  { key: "missedCalls", label: "Missed calls", icon: PhoneMissed, suffix: "" },
  { key: "csat", label: "CSAT", icon: Star, suffix: "/5" },
  { key: "conversionRate", label: "Conversion", icon: Activity, suffix: "%" },
];

export default function Analytics() {
  const analytics = useStore((state) => state.analytics);
  const loadAnalyticsFromBackend = useStore((state) => state.loadAnalyticsFromBackend);

  // Load analytics from backend on mount
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        await loadAnalyticsFromBackend();
      } catch (error) {
        console.error("Failed to load analytics:", error);
      }
    };

    loadAnalytics();

    // Optionally refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [loadAnalyticsFromBackend]);

  return (
    <section className="analytics-grid">
      {cardMap.map(({ key, label, icon: Icon, suffix }, index) => (
        <motion.article
          className="panel metric-card"
          key={key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.3 }}
        >
          <div className="metric-topline">
            <span className="metric-icon">
              <Icon size={18} />
            </span>
            <span className="eyebrow">{label}</span>
          </div>
          <strong className="metric-value">
            {analytics[key]}
            {suffix}
          </strong>
        </motion.article>
      ))}
    </section>
  );
}
