import { useLocation, useNavigate } from "react-router-dom";


import {
  LayoutDashboard,
  Users,
  IndianRupee,
  UserCog,
  FileBarChart,
  Settings,
  CalendarCheck
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Leads",
      path: "/leads",
      icon: Users,
    },
    {
      label: "Payments",
      path: "/payments",
      icon: IndianRupee,
    },
    {
      label: "Employees",
      path: "/employees",
      icon: UserCog,
    },

    {
  label: "Attendance",
  path: "/attendance",
  icon: CalendarCheck,
},
    {
      label: "Reports",
      path: "/reports",
      icon: FileBarChart,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white">
      <div className="border-b border-blue-700 p-5">
        <h1 className="text-2xl font-bold">
          MFS CRM
        </h1>

        <p className="text-sm text-blue-200">
          Mahakal Financial Services
        </p>
      </div>

      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() =>
                navigate(item.path)
              }
              className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${
                location.pathname.startsWith(
                  item.path
                )
                  ? "bg-blue-700"
                  : "hover:bg-blue-800"
              }`}
            >
              <Icon size={20} />

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}