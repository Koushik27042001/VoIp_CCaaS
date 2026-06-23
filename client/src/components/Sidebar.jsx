import {
  Cog,
  LayoutDashboard,
  ListChecks,
  LogOut,
  PhoneCall,
  Users,
  Waypoints,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const navByRole = {
  admin: [
    { label: "Control", path: "/admin", Icon: LayoutDashboard },
    { label: "Agents", path: "/admin/agents", Icon: Users },
    { label: "Leads", path: "/admin/leads", Icon: ListChecks },
    { label: "Assign", path: "/admin/assignments", Icon: Waypoints },
    { label: "Settings", path: "/agent/settings/sip-trunks", Icon: Cog },
  ],
  agent: [
    { label: "Workspace", path: "/agent", Icon: LayoutDashboard },
    { label: "My Leads", path: "/agent/leads", Icon: ListChecks },
    { label: "Calls", path: "/agent/calls", Icon: PhoneCall },
    { label: "Settings", path: "/agent/settings/sip-trunks", Icon: Cog },
  ],
};

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resolvedRole = role || user?.role || "agent";
  const menu = navByRole[resolvedRole] || navByRole.agent;

  const handleLogout = () => {
    logout();
    navigate("/agent", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>{resolvedRole === "admin" ? "A" : "V"}</span>
      </div>

      <div className="sidebar-user">
        <p>{user?.name || "Agent"}</p>
        <span>{resolvedRole}</span>
      </div>

      <nav className="sidebar-nav">
        {menu.map(({ label, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-button ${isActive ? "active" : ""}`
            }
          >
            <Icon className="mx-auto mb-1 h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout}>
        <LogOut className="mx-auto mb-1 h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
