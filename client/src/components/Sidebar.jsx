import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { label: "Overview", path: "/" },
    { label: "Dialer", path: "/dialer" },
    { label: "Leads", path: "/leads" },
    { label: "Insights", path: "/insights" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-24 h-screen bg-[#0B0B2B] p-4">
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
    </div>
  );
}

