import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const menu = [
    { label: "Overview", path: "/" },
    { label: "Dialer", path: "/dialer" },
    { label: "Leads", path: "/leads" },
    { label: "Insights", path: "/insights" },
    { label: "Settings", path: "/settings" },
  ];

  if (user?.role === "admin") {
    menu.push({ label: "Agents", path: "/admin/agents" });
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar w-24 h-screen bg-[#0B0B2B] p-4 flex flex-col">
      <div className="sidebar-user mb-6 text-center">
        <p className="text-xs text-gray-400 truncate">{user?.name || "Agent"}</p>
        <span className="text-[10px] uppercase text-violet-400">{user?.role}</span>
      </div>

      <nav className="flex-1">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block mb-4 p-4 rounded-xl text-center ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "bg-[#1A1A40] text-gray-300"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-logout p-3 rounded-xl bg-[#1A1A40] text-gray-300 text-sm"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  );
}
