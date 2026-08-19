import { useLocation } from "react-router-dom";

import { Bell } from "lucide-react";

import { useAppSelector } from "../../hooks/redux";

import LogoutButton from "../auth/LogoutButton";

export default function Header() {
  const location = useLocation();

  const employee = useAppSelector(
    (state) => state.auth.employee
  );

  const pageTitle =
    location.pathname === "/dashboard"
      ? "Dashboard"
      : location.pathname.startsWith("/leads")
      ? "Lead Management"
      : location.pathname.startsWith("/clients")
      ? "Client Management"
      : location.pathname.startsWith("/payments")
      ? "Payment Management"
      : location.pathname.startsWith("/employees")
      ? "Employee Management"
      : location.pathname.startsWith("/reports")
      ? "Reports"
      : "MFS CRM";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-xl font-semibold">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-5">
        <button className="relative">
          <Bell size={22} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="text-right">
          <p className="font-medium">
            {employee?.name}
          </p>

          <p className="text-sm text-gray-500">
            {employee?.employeeCode}
          </p>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
}