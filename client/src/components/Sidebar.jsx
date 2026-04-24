import { motion } from "framer-motion";
import { HiOutlineSquares2X2, HiOutlinePhone, HiOutlineUsers, HiOutlineChartBar, HiOutlineCog6Tooth } from "react-icons/hi2";
import { useStore } from "../store/useStore";

const items = [
  { id: "overview", icon: HiOutlineSquares2X2, label: "Overview" },
  { id: "dialer", icon: HiOutlinePhone, label: "Dialer" },
  { id: "leads", icon: HiOutlineUsers, label: "Leads" },
  { id: "analytics", icon: HiOutlineChartBar, label: "Insights" },
];

export default function Sidebar() {
  const activeView = useStore((state) => state.activeView);
  const setActiveView = useStore((state) => state.setActiveView);

  return (
    <aside className="sidebar-modern">
      <div className="brand-container">
        <div className="logo-v">VC</div>
      </div>

      <nav className="nav-items">
        {items.map(({ id, icon: Icon, label }) => (
          <motion.div key={id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={() => setActiveView(id)}
              className={`nav-btn ${activeView === id ? "active" : ""}`}
              title={label}
            >
              <Icon size={24} />
              {activeView === id && (
                <motion.div
                  layoutId="nav-pill"
                  className="active-pill"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          </motion.div>
        ))}
      </nav>

      <motion.button className="nav-btn settings-btn" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <HiOutlineCog6Tooth size={24} />
      </motion.button>
    </aside>
  );
}
