import { BarChart3, Headset, LayoutDashboard, Settings, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../store/useStore";

const items = [
  { id: "dialer", label: "Dialer", icon: Headset },
  { id: "leads", label: "Leads", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "overview", label: "Overview", icon: LayoutDashboard },
];

export default function Sidebar() {
  const activeView = useStore((state) => state.activeView);
  const setActiveView = useStore((state) => state.setActiveView);

  return (
    <aside className="sidebar">
      <div className="brand-mark">VC</div>

      <nav className="sidebar-nav">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-button ${activeView === id ? "active" : ""}`}
            onClick={() => setActiveView(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
            {activeView === id ? <motion.div className="sidebar-glow" layoutId="sidebar-glow" /> : null}
          </button>
        ))}
      </nav>

      <button type="button" className="sidebar-button muted">
        <Settings size={18} />
        <span>Settings</span>
      </button>
    </aside>
  );
}
