import {
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  FlaskConical,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  UserCog,
  UsersRound,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

/* ============================
   TYPES
============================ */

export type SettingsSection =
  | "COMPANY"
  | "LEADS"
  | "CALLING"
  | "FOLLOW_UP"
  | "DEMO_PRODUCTS"
  | "TRIAL"
  | "EMPLOYEES"
  | "ATTENDANCE"
  | "GENERAL"
  | "SECURITY";

interface SettingsNavigationItem {
  id: SettingsSection;

  label: string;

  description: string;

  icon:
    React.ElementType;
}

interface SettingsLayoutProps {
  activeSection:
    SettingsSection;

  onSectionChange:
    (
      section:
        SettingsSection
    ) => void;

  searchValue: string;

  onSearchChange:
    (
      value: string
    ) => void;

  children:
    ReactNode;
}

/* ============================
   NAVIGATION
============================ */

const navigationItems:
  SettingsNavigationItem[] = [
    {
      id: "COMPANY",

      label:
        "Company",

      description:
        "Company profile and contact details",

      icon:
        Building2,
    },

    {
      id: "LEADS",

      label:
        "Lead Settings",

      description:
        "Statuses, sources and lead defaults",

      icon:
        Target,
    },

    {
      id: "CALLING",

      label:
        "Calling",

      description:
        "Calling targets and defaults",

      icon:
        Phone,
    },

    {
      id: "FOLLOW_UP",

      label:
        "Follow-up",

      description:
        "Follow-up rules and reminders",

      icon:
        CalendarClock,
    },

    {
      id: "DEMO_PRODUCTS",

      label:
        "Demo Products",

      description:
        "Cash, Options, Futures, MCX and more",

      icon:
        FlaskConical,
    },

    {
      id: "TRIAL",

      label:
        "Trial / Demo",

      description:
        "Trial duration and extension rules",

      icon:
        SlidersHorizontal,
    },

    {
      id: "EMPLOYEES",

      label:
        "Employees",

      description:
        "Employee control and account settings",

      icon:
        UsersRound,
    },

    {
      id: "ATTENDANCE",

      label:
        "Attendance",

      description:
        "Office timing and attendance rules",

      icon:
        CalendarDays,
    },

    {
      id: "GENERAL",

      label:
        "General",

      description:
        "Timezone, date and system defaults",

      icon:
        Settings,
    },

    {
      id: "SECURITY",

      label:
        "Security",

      description:
        "Access and login controls",

      icon:
        ShieldCheck,
    },
  ];

/* ============================
   LAYOUT
============================ */

export default function SettingsLayout({
  activeSection,
  onSectionChange,
  searchValue,
  onSearchChange,
  children,
}: SettingsLayoutProps) {
  const activeItem =
    navigationItems.find(
      (item) =>
        item.id ===
        activeSection
    );

  const filteredNavigation =
    searchValue.trim()
      ? navigationItems.filter(
          (item) => {
            const search =
              searchValue
                .trim()
                .toLowerCase();

            return (
              item.label
                .toLowerCase()
                .includes(
                  search
                ) ||
              item.description
                .toLowerCase()
                .includes(
                  search
                )
            );
          }
        )
      : navigationItems;

  return (
    <div className="min-h-full bg-slate-50">
      {/* ============================
          HEADER
      ============================ */}

      <div className="border-b border-slate-200 bg-white">
        <div className="px-5 py-5 lg:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Admin Control Panel
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage CRM configuration
                without changing backend
                code.
              </p>
            </div>

            {/* SEARCH */}

            <div className="w-full xl:w-96">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    searchValue
                  }
                  onChange={(
                    event
                  ) =>
                    onSearchChange(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search settings..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================
          BODY
      ============================ */}

      <div className="flex flex-col lg:flex-row">
        {/* ============================
            LEFT NAVIGATION
        ============================ */}

        <aside className="border-b border-slate-200 bg-white lg:min-h-[calc(100vh-145px)] lg:w-80 lg:border-b-0 lg:border-r">
          <div className="p-3 lg:p-4">
            <div className="mb-3 hidden px-3 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Configuration
              </p>
            </div>

            {/* MOBILE NAV */}

            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {filteredNavigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    activeSection ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        onSectionChange(
                          item.id
                        )
                      }
                      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon
                        size={16}
                      />

                      {
                        item.label
                      }
                    </button>
                  );
                }
              )}
            </div>

            {/* DESKTOP NAV */}

            <div className="hidden space-y-1 lg:block">
              {filteredNavigation.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    activeSection ===
                    item.id;

                  return (
                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        onSectionChange(
                          item.id
                        )
                      }
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                        }`}
                      >
                        <Icon
                          size={18}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold ${
                            active
                              ? "text-blue-800"
                              : "text-slate-800"
                          }`}
                        >
                          {
                            item.label
                          }
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {
                            item.description
                          }
                        </p>
                      </div>

                      <ChevronRight
                        size={16}
                        className={
                          active
                            ? "text-blue-600"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  );
                }
              )}

              {filteredNavigation.length ===
                0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No settings found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ============================
            MAIN CONTENT
        ============================ */}

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-350 p-4 sm:p-5 lg:p-7">
            {/* BREADCRUMB */}

            <div className="mb-5 flex items-center gap-2 text-sm">
              <span className="text-slate-400">
                Settings
              </span>

              <ChevronRight
                size={14}
                className="text-slate-300"
              />

              <span className="font-medium text-slate-700">
                {activeItem?.label ||
                  "Control Panel"}
              </span>
            </div>

            {/* PAGE CONTENT */}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================
   SECTION HEADER
============================ */

export function SettingsSectionHeader({
  title,
  description,
  action,
}: {
  title: string;

  description?: string;

  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

/* ============================
   SETTINGS CARD
============================ */

export function SettingsCard({
  title,
  description,
  children,
  action,
  className = "",
}: {
  title?: string;

  description?: string;

  children:
    ReactNode;

  action?: ReactNode;

  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(title ||
        description ||
        action) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h3 className="font-semibold text-slate-900">
                {title}
              </h3>
            )}

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {
                  description
                }
              </p>
            )}
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

/* ============================
   SETTING ROW
============================ */

export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;

  description?: string;

  children:
    ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-slate-100 py-5 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_minmax(260px,420px)] lg:items-center">
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        {description && (
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            {
              description
            }
          </p>
        )}
      </div>

      <div>
        {children}
      </div>
    </div>
  );
}

/* ============================
   STATUS BADGE
============================ */

export function SettingsStatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active
        ? "Active"
        : "Inactive"}
    </span>
  );
}

/* ============================
   EMPTY STATE
============================ */

export function SettingsEmptyState({
  title,
  description,
  action,
}: {
  title: string;

  description?: string;

  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <UserCog
        size={32}
        className="text-slate-300"
      />

      <p className="mt-3 font-semibold text-slate-700">
        {title}
      </p>

      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-500">
          {
            description
          }
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}