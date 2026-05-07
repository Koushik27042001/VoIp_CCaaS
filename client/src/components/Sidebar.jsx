import { BarChart3, Grid2X2, Headphones, Settings, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";

const items = [
  { id: "dialer", label: "Dialer", Icon: Headphones },
  { id: "leads", label: "Leads", Icon: UsersRound },
  { id: "analytics", label: "Insights", Icon: BarChart3 },
  { id: "overview", label: "Overview", Icon: Grid2X2 },
];

export default function Sidebar() {
  const activeView = useStore((state) => state.activeView);
  const setActiveView = useStore((state) => state.setActiveView);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <button className="brand-mark" type="button" aria-label="VoIP Command Center">
          VC
        </button>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {items.map(({ id, label, Icon }) => (
            <motion.button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-current={activeView === id ? "page" : undefined}
              className={`sidebar-button ${activeView === id ? "active" : ""}`}
              onClick={() => setActiveView(id)}
              whileTap={{ scale: 0.94 }}
            >
              <Icon size={19} strokeWidth={2.25} />
              <span>{label}</span>
            </motion.button>
          ))}
        </nav>
      </div>

      <button className="sidebar-button settings-button" type="button" aria-label="Settings">
        <Settings size={18} strokeWidth={2.25} />
        <span>Settings</span>
      </button>
    </aside>
  );
}
