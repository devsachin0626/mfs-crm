import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,

  UserCog,
  FileBarChart,
  Settings,
  CalendarCheck,
  CalendarDays,
  Target,
  Banknote,
  CalendarClock,
  Phone,
  Columns3,
  FlaskConical,
  CircleUserRound,
} from "lucide-react";

import {
  useAppSelector,
} from "../../hooks/redux";

import {
  getBrandSettings,
} from "../../services/settings.service";

/* ============================
   TYPES
============================ */

type MenuItem = {
  label: string;

  path: string;

  icon:
    React.ElementType;

  roles?: string[];
};

/* ============================
   DEFAULT BRAND
============================ */

const DEFAULT_COMPANY_NAME =
  "Mahakal Financial Services";

const DEFAULT_CRM_NAME =
  "MFS CRM";

/* ============================
   SIDEBAR
============================ */

export default function Sidebar() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  /* ============================
     COMPANY NAME
  ============================ */

  const [
    companyName,
    setCompanyName,
  ] =
    useState(
      DEFAULT_COMPANY_NAME
    );

  const [
    crmName,
    setCrmName,
  ] =
    useState(
      DEFAULT_CRM_NAME
    );

  /* ============================
     LOAD BRAND
  ============================ */

  useEffect(() => {
    const loadBrand =
      async () => {
        try {
          const response =
            await getBrandSettings();

          setCompanyName(
            response?.brand
              ?.companyName ||
              DEFAULT_COMPANY_NAME
          );

          setCrmName(
            response?.brand
              ?.crmDisplayName ||
              DEFAULT_CRM_NAME
          );
        } catch {
          /*
           * Brand API fail hone par
           * sidebar break nahi karega.
           */

          setCompanyName(
            DEFAULT_COMPANY_NAME
          );

          setCrmName(
            DEFAULT_CRM_NAME
          );
        }
      };

    void loadBrand();
  }, []);

  /* ============================
     ROLE
  ============================ */

  const roleName = (() => {
    const role =
      employee?.role as unknown;

    if (
      typeof role ===
      "string"
    ) {
      return role;
    }

    if (
      role &&
      typeof role ===
        "object" &&
      "name" in role
    ) {
      return String(
        (
          role as {
            name: string;
          }
        ).name
      );
    }

    return "";
  })();

  /* ============================
     MENU
  ============================ */

  const menuItems:
    MenuItem[] = [
      {
        label:
          "Dashboard",

        path:
          "/dashboard",

        icon:
          LayoutDashboard,
      },

      {
        label:
          "My Profile",

        path:
          "/profile",

        icon:
          CircleUserRound,
      },

      {
        label:
          "Leads",

        path:
          "/leads",

        icon:
          Users,
      },

      {
        label:
          "Pipeline",

        path:
          "/leads/pipeline",

        icon:
          Columns3,
      },

      {
        label:
          "Calling",

        path:
          "/calling",

        icon:
          Phone,
      },

      {
        label:
          "Follow Ups",

        path:
          "/follow-ups",

        icon:
          CalendarClock,
      },

      {
        label:
          "Demo / Trials",

        path:
          "/trials",

        icon:
          FlaskConical,
      },

     
      {
        label:
          "Employees",

        path:
          "/employees",

        icon:
          UserCog,

        roles: [
          "ADMIN",
          "HR",
          "TEAM_LEADER",
        ],
      },

      {
        label:
          "Attendance",

        path:
          "/attendance",

        icon:
          CalendarCheck,
      },

      {
        label:
          "Leaves",

        path:
          "/leaves",

        icon:
          CalendarDays,
      },

      {
        label:
          "Targets",

        path:
          "/targets",

        icon:
          Target,
      },

      {
        label:
          "Payroll",

        path:
          "/payroll",

        icon:
          Banknote,

        roles: [
          "ADMIN",
          "HR",
        ],
      },

      {
        label:
          "Reports",

        path:
          "/reports",

        icon:
          FileBarChart,

        roles: [
          "ADMIN",
        ],
      },

      {
        label:
          "Settings",

        path:
          "/settings",

        icon:
          Settings,

        roles: [
          "ADMIN",
        ],
      },
    ];

  /* ============================
     ROLE FILTER
  ============================ */

  const visibleMenuItems =
    menuItems.filter(
      (item) => {
        if (
          !item.roles ||
          item.roles.length ===
            0
        ) {
          return true;
        }

        return item.roles.includes(
          roleName
        );
      }
    );

  /* ============================
     ACTIVE ROUTE
  ============================ */

  const isActive = (
    path: string
  ) => {
    if (
      path ===
      "/dashboard"
    ) {
      return (
        location.pathname ===
        "/dashboard"
      );
    }

    if (
      path ===
      "/leads"
    ) {
      return (
        location.pathname ===
          "/leads" ||
        location.pathname ===
          "/leads/create" ||
        (
          location.pathname.startsWith(
            "/leads/"
          ) &&
          !location.pathname.startsWith(
            "/leads/pipeline"
          ) &&
          !location.pathname.startsWith(
            "/leads/import"
          )
        )
      );
    }

    return (
      location.pathname ===
        path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-blue-800 bg-blue-950 text-white shadow-xl shadow-slate-900/10">
      {/* ============================
          BRAND
      ============================ */}

      <div className="shrink-0 border-b border-blue-800 p-5">
        <h1 className="text-2xl font-bold">
          {crmName}
        </h1>

        <p className="mt-1 truncate text-sm text-blue-200">
          {companyName}
        </p>
      </div>

      {/* ============================
          USER
      ============================ */}

      <div className="shrink-0 border-b border-blue-800 px-5 py-4">
        <p className="truncate text-sm font-semibold text-white">
          {employee?.name ||
            "Employee"}
        </p>

        <p className="mt-1 text-xs text-blue-300">
          {roleName ||
            "USER"}
        </p>
      </div>

      {/* ============================
          NAVIGATION
      ============================ */}

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4">
        {visibleMenuItems.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              isActive(
                item.path
              );

            return (
              <button
                key={
                  item.path
                }
                type="button"
                onClick={() =>
                  navigate(
                    item.path
                  )
                }
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`}
              >
                <Icon
                  size={19}
                />

                <span>
                  {
                    item.label
                  }
                </span>
              </button>
            );
          }
        )}
      </nav>

      {/* ============================
          FOOTER
      ============================ */}

      <div className="shrink-0 border-t border-blue-800 p-4">
        <p className="text-center text-xs text-blue-300">
          {crmName}
        </p>
      </div>
    </aside>
  );
}
