import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Bell } from "lucide-react";

import { useAppSelector } from "../../hooks/redux";
import { getFollowUps } from "../../services/followup.service";

import LogoutButton from "../auth/LogoutButton";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const employee = useAppSelector(
    (state) => state.auth.employee
  );

  const [dueFollowUps, setDueFollowUps] = useState(0);

  const loadDueFollowUps = useCallback(async () => {
    if (!employee?.id) {
      setDueFollowUps(0);
      return;
    }

    try {
      const due = await getFollowUps({
        employeeId: employee.id,
        view: "OVERDUE",
        isCompleted: false,
        page: 1,
        limit: 1,
      });

      setDueFollowUps(due.total || 0);
    } catch (error) {
      console.error("Follow-up notification error", error);
    }
  }, [employee?.id]);

  useEffect(() => {
    void loadDueFollowUps();

    const timer = window.setInterval(() => {
      void loadDueFollowUps();
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [loadDueFollowUps]);

  const pageTitle =
    location.pathname === "/dashboard"
      ? "Dashboard"
      : location.pathname === "/profile"
      ? "My Profile"
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
        <button
          type="button"
          className="relative"
          aria-label={`${dueFollowUps} follow-ups due`}
          title={`${dueFollowUps} follow-ups due`}
          onClick={() => navigate("/follow-ups")}
        >
          <Bell size={22} />

          {dueFollowUps > 0 && (
            <span className="absolute -right-2.5 -top-2.5 min-w-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-5 text-white">
              {dueFollowUps > 99 ? "99+" : dueFollowUps}
            </span>
          )}
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
