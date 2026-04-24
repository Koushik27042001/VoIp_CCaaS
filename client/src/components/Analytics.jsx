import { motion } from "framer-motion";
import { useStore } from "../store/useStore";

const metrics = [
  { key: "callsHandled", label: "Calls Handled" },
  { key: "missedCalls", label: "Missed Calls" },
  { key: "conversionRate", label: "Conversion Rate", suffix: "%" },
  { key: "avgHandleTime", label: "Avg Handle Time" },
];

export default function Analytics() {
  const analytics = useStore((state) => state.analytics);

  return (
    <section className="analytics-grid">
      {metrics.map(({ key, label, suffix = "" }) => (
        <motion.article
          key={key}
          className="metric-card"
          whileHover={{ y: -4 }}
        >
          <p>{label}</p>

          <strong>
            {analytics?.[key] ?? 0}
            {suffix}
          </strong>
        </motion.article>
      ))}
    </section>
  );
}
