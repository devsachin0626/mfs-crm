import {
  useEffect,
} from "react";

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Phone,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchDashboard,
} from "../../store/slices/dashboardSlice";

export default function DashboardPage() {
  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

  const {
    data,
    loading,
    error,
  } =
    useAppSelector(
      (state) =>
        state.dashboard
    );

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  useEffect(() => {
    dispatch(
      fetchDashboard()
    );
  }, [dispatch]);

  const stats =
    data?.stats;

  const recentLeads =
    data?.recentLeads ||
    [];

  const hotLeads =
    data?.hotLeads ||
    [];

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

  const conversionRate =
    stats?.conversionRate ??
    (
      stats?.totalLeads
        ? Number(
            (
              (
                stats.convertedLeads /
                stats.totalLeads
              ) *
              100
            ).toFixed(1)
          )
        : 0
    );

  const callProgress =
    stats?.callProgress ??
    0;

  const dailyCallTarget =
    stats?.dailyCallTarget ??
    250;

  const showTeamOverview =
    roleName === "ADMIN" ||
    roleName === "HR" ||
    roleName ===
      "TEAM_LEADER";

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            CRM Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Welcome
            {employee?.name
              ? `, ${employee.name}`
              : ""}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track leads, calls,
            follow-ups and
            performance from one
            place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              dispatch(
                fetchDashboard()
              )
            }
            disabled={
              loading
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/leads/create"
              )
            }
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            + New Lead
          </button>
        </div>
      </div>

      {/* ============================
          ERROR
      ============================ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            Dashboard Error
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              dispatch(
                fetchDashboard()
              )
            }
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================
          KPI CARDS
      ============================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Leads"
          value={
            loading
              ? "-"
              : stats
                  ?.totalLeads ??
                0
          }
          description="Accessible CRM leads"
          icon={
            <Users
              size={19}
            />
          }
        />

        <StatCard
          title="Today's Calls"
          value={
            loading
              ? "-"
              : stats
                  ?.callsToday ??
                0
          }
          description={`${dailyCallTarget} daily target`}
          icon={
            <Phone
              size={19}
            />
          }
        />

        <StatCard
          title="Today's Follow-ups"
          value={
            loading
              ? "-"
              : stats
                  ?.todayFollowUps ??
                0
          }
          description="Follow-ups due today"
          icon={
            <CalendarClock
              size={19}
            />
          }
        />

        <StatCard
          title="Converted"
          value={
            loading
              ? "-"
              : stats
                  ?.convertedLeads ??
                0
          }
          description="Successfully converted"
          icon={
            <UserCheck
              size={19}
            />
          }
        />

        <StatCard
          title="Conversion Rate"
          value={
            loading
              ? "-"
              : `${conversionRate}%`
          }
          description="Overall conversion"
          icon={
            <TrendingUp
              size={19}
            />
          }
        />
      </div>

      {/* ============================
          MAIN GRID
      ============================ */}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* PIPELINE */}

        <DashboardCard
          title="Lead Pipeline"
          subtitle="Current sales pipeline overview"
          action={
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/leads/pipeline"
                )
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              View Pipeline

              <ArrowRight
                size={15}
              />
            </button>
          }
        >
          <div className="space-y-5">
            <PipelineRow
              label="Total Leads"
              value={
                stats
                  ?.totalLeads ??
                0
              }
              total={
                stats
                  ?.totalLeads ??
                0
              }
            />

            <PipelineRow
              label="Open Leads"
              value={
                stats
                  ?.openLeads ??
                0
              }
              total={
                stats
                  ?.totalLeads ??
                0
              }
            />

            <PipelineRow
              label="Converted"
              value={
                stats
                  ?.convertedLeads ??
                0
              }
              total={
                stats
                  ?.totalLeads ??
                0
              }
            />

            <PipelineRow
              label="Lost"
              value={
                stats
                  ?.lostLeads ??
                0
              }
              total={
                stats
                  ?.totalLeads ??
                0
              }
            />
          </div>
        </DashboardCard>

        {/* TODAY */}

        <DashboardCard
          title="Today"
          subtitle="Daily activity"
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Calling Progress
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {stats
                      ?.callsToday ??
                      0}{" "}
                    /{" "}
                    {
                      dailyCallTarget
                    }{" "}
                    calls
                  </p>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {
                    callProgress
                  }
                  %
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      callProgress,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-lg font-bold text-slate-900">
                    {stats
                      ?.connectedCallsToday ??
                      0}
                  </p>

                  <p className="text-xs text-slate-500">
                    Connected
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-lg font-bold text-slate-900">
                    {stats
                      ?.interestedCallsToday ??
                      0}
                  </p>

                  <p className="text-xs text-slate-500">
                    Interested
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-lg font-bold text-slate-900">
                    {stats
                      ?.connectRate ??
                      0}
                    %
                  </p>

                  <p className="text-xs text-slate-500">
                    Connect Rate
                  </p>
                </div>
              </div>
            </div>

            <ActionMetric
              title="Follow-ups Due"
              value={
                stats
                  ?.todayFollowUps ??
                0
              }
              icon={
                <Clock3
                  size={18}
                />
              }
              onClick={() =>
                navigate(
                  "/follow-ups"
                )
              }
            />

            <ActionMetric
              title="Overdue Follow-ups"
              value={
                stats
                  ?.overdueFollowUps ??
                0
              }
              icon={
                <CalendarClock
                  size={18}
                />
              }
              onClick={() =>
                navigate(
                  "/follow-ups"
                )
              }
            />

            <ActionMetric
              title="Calling Workspace"
              value="Open"
              icon={
                <Phone
                  size={18}
                />
              }
              onClick={() =>
                navigate(
                  "/calling"
                )
              }
            />
          </div>
        </DashboardCard>
      </div>

      {/* ============================
          RECENT + HOT
      ============================ */}

      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardCard
          title="Recent Leads"
          subtitle="Latest leads added to CRM"
          action={
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/leads"
                )
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            >
              View All

              <ArrowRight
                size={15}
              />
            </button>
          }
        >
          <div className="space-y-2">
            {loading ? (
              <LoadingRows />
            ) : recentLeads.length ===
              0 ? (
              <EmptyState
                text="No recent leads found."
              />
            ) : (
              recentLeads.map(
                (
                  lead: any
                ) => (
                  <LeadRow
                    key={
                      lead.id
                    }
                    lead={
                      lead
                    }
                    onClick={() =>
                      navigate(
                        `/leads/${lead.id}`
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Hot Leads"
          subtitle="Priority working and follow-up leads"
          action={
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/leads"
                )
              }
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"
            >
              View Leads

              <ArrowRight
                size={15}
              />
            </button>
          }
        >
          <div className="space-y-2">
            {loading ? (
              <LoadingRows />
            ) : hotLeads.length ===
              0 ? (
              <EmptyState
                text="No hot leads found."
              />
            ) : (
              hotLeads.map(
                (
                  lead: any
                ) => (
                  <LeadRow
                    key={
                      lead.id
                    }
                    lead={
                      lead
                    }
                    showFollowUp
                    onClick={() =>
                      navigate(
                        `/leads/${lead.id}`
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </DashboardCard>
      </div>

      {/* ============================
          THIRD GRID
      ============================ */}

      <div className="grid gap-5 xl:grid-cols-3">
        {/* QUICK ACTIONS */}

        <DashboardCard
          title="Quick Actions"
          subtitle="Common CRM tasks"
        >
          <div className="space-y-3">
            <QuickAction
              title="Create New Lead"
              description="Add a new client prospect"
              onClick={() =>
                navigate(
                  "/leads/create"
                )
              }
            />

            <QuickAction
              title="Open Calling Queue"
              description="Start today's calling"
              onClick={() =>
                navigate(
                  "/calling"
                )
              }
            />

            <QuickAction
              title="View Follow-ups"
              description="Check scheduled callbacks"
              onClick={() =>
                navigate(
                  "/follow-ups"
                )
              }
            />

            <QuickAction
              title="View Targets"
              description="Track monthly performance"
              onClick={() =>
                navigate(
                  "/targets"
                )
              }
            />
          </div>
        </DashboardCard>

        {/* PERFORMANCE */}

        <DashboardCard
          title="Performance"
          subtitle="Lead conversion overview"
        >
          <div className="flex min-h-64 flex-col items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-14 border-slate-100">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {
                    conversionRate
                  }
                  %
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Conversion
                </p>
              </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <MiniMetric
                label="This Month"
                value={
                  stats
                    ?.convertedThisMonth ??
                  0
                }
              />

              <MiniMetric
                label="Lost"
                value={
                  stats
                    ?.lostLeads ??
                  0
                }
              />
            </div>
          </div>
        </DashboardCard>

        {/* TEAM / PERSONAL */}

        <DashboardCard
          title={
            showTeamOverview
              ? "Team Overview"
              : "My Overview"
          }
          subtitle={
            showTeamOverview
              ? "Employee activity"
              : "Your CRM activity"
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {showTeamOverview
                      ? "Active Employees"
                      : "Accessible Leads"}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {showTeamOverview
                      ? stats
                          ?.totalEmployees ??
                        0
                      : stats
                          ?.totalLeads ??
                        0}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3 text-blue-700 shadow-sm">
                  <Users
                    size={22}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                  <CheckCircle2
                    size={18}
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    CRM Activity
                  </p>

                  <p className="text-xs text-slate-500">
                    {
                      stats
                        ?.pendingFollowUps ??
                      0
                    }{" "}
                    follow-ups currently
                    pending.
                  </p>
                </div>
              </div>
            </div>

            {showTeamOverview ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/employees"
                  )
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Employees
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/leads"
                  )
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View My Leads
              </button>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* ============================
          BOTTOM STATS
      ============================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SmallStat
          label="New Leads Today"
          value={
            stats
              ?.newLeadsToday ??
            0
          }
        />

        <SmallStat
          label="Overdue Follow-ups"
          value={
            stats
              ?.overdueFollowUps ??
            0
          }
          onClick={() =>
            navigate(
              "/follow-ups"
            )
          }
        />

        <SmallStat
          label="Converted This Month"
          value={
            stats
              ?.convertedThisMonth ??
            0
          }
        />

        <SmallStat
          label="Open Leads"
          value={
            stats?.openLeads ??
            0
          }
          onClick={() =>
            navigate(
              "/leads"
            )
          }
        />
      </div>
    </div>
  );
}

/* ============================
   STAT CARD
============================ */

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value:
    | string
    | number;
  description: string;
  icon:
    React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================
   DASHBOARD CARD
============================ */

function DashboardCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?:
    React.ReactNode;
  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

/* ============================
   PIPELINE
============================ */

function PipelineRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.min(
          (
            value /
            total
          ) *
            100,
          100
        )
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="font-semibold text-slate-900">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ============================
   ACTION METRIC
============================ */

function ActionMetric({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value:
    | number
    | string;
  icon:
    React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div className="rounded-lg bg-slate-50 p-2.5 text-blue-700">
        {icon}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">
          {title}
        </p>
      </div>

      <span className="font-bold text-slate-900">
        {value}
      </span>
    </button>
  );
}

/* ============================
   QUICK ACTION
============================ */

function QuickAction({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight
        size={17}
        className="shrink-0 text-slate-400"
      />
    </button>
  );
}

/* ============================
   LEAD ROW
============================ */

function LeadRow({
  lead,
  onClick,
  showFollowUp = false,
}: {
  lead: any;
  onClick: () => void;
  showFollowUp?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-100 p-3.5 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">
          {lead.name ||
            "Unnamed Lead"}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {lead.leadCode}
          {" · "}
          {lead.mobile}
        </p>

        {showFollowUp &&
          lead.nextFollowUp && (
            <p className="mt-1 text-xs text-amber-700">
              Follow-up:{" "}
              {formatDateTime(
                lead.nextFollowUp
              )}
            </p>
          )}
      </div>

      <div className="shrink-0 text-right">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {String(
            lead.stage ||
              ""
          ).replaceAll(
            "_",
            " "
          )}
        </span>

        {lead.assignedEmployee
          ?.name && (
          <p className="mt-1 max-w-28 truncate text-xs text-slate-400">
            {
              lead
                .assignedEmployee
                .name
            }
          </p>
        )}
      </div>
    </button>
  );
}

/* ============================
   MINI METRIC
============================ */

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">
      <p className="text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* ============================
   SMALL STAT
============================ */

function SmallStat({
  label,
  value,
  onClick,
}: {
  label: string;
  value:
    | number
    | string;
  onClick?: () => void;
}) {
  const content = (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="h-full text-left"
    >
      {content}
    </button>
  );
}

/* ============================
   EMPTY / LOADING
============================ */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-8 text-center">
      <p className="text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-xl bg-slate-100"
          />
        )
      )}
    </div>
  );
}

/* ============================
   DATE
============================ */

function formatDateTime(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}