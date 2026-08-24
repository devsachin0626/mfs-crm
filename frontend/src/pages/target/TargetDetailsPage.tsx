import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BadgeIndianRupee,
  CalendarDays,
  Edit3,
  Target,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

import {
  getTargetById,
} from "../../services/target.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  EmployeeTarget,
} from "../../types/target.types";

/* ============================
   ROLE HELPER
============================ */

const getRoleName = (
  role: unknown
): string => {
  if (
    typeof role === "string"
  ) {
    return role;
  }

  if (
    role &&
    typeof role === "object" &&
    "name" in role
  ) {
    const roleObject =
      role as {
        name?: unknown;
      };

    if (
      typeof roleObject.name ===
      "string"
    ) {
      return roleObject.name;
    }
  }

  return "";
};

export default function TargetDetailsPage() {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
    useNavigate();

  const currentEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const roleName =
    getRoleName(
      currentEmployee?.role
    );

  const canEdit =
    roleName === "ADMIN" ||
    roleName === "HR";

  const [
    target,
    setTarget,
  ] =
    useState<EmployeeTarget | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  /* ============================
     LOAD TARGET
  ============================ */

  useEffect(() => {
    const loadTarget =
      async () => {
        if (!id) {
          setError(
            "Target ID is missing"
          );

          setLoading(
            false
          );

          return;
        }

        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const response =
            await getTargetById(
              id
            );

          setTarget(
            response.target
          );
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data
              ?.message ||
              error?.message ||
              "Failed to load target"
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadTarget();
  }, [id]);

  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

        <p className="mt-3 text-sm text-slate-500">
          Loading target...
        </p>
      </div>
    );
  }

  /* ============================
     ERROR
  ============================ */

  if (
    error &&
    !target
  ) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/targets"
            )
          }
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft
            size={17}
          />

          Back to Targets
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!target) {
    return null;
  }

  const brokerageTarget =
    Number(
      target.brokerageTarget ||
        0
    );

  const revenueTarget =
    Number(
      target.revenueTarget ||
        0
    );

  const achieved =
    Number(
      target.achievedAmount ||
        0
    );

  const progress =
    Number(
      target.progressPercent ??
        (
          brokerageTarget > 0
            ? achieved /
              brokerageTarget *
              100
            : 0
        )
    );

  const remaining =
    Math.max(
      brokerageTarget -
        achieved,
      0
    );

  const safeProgress =
    Math.max(
      progress,
      0
    );

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/targets"
              )
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Target Details
            </h1>

            <p className="text-sm text-slate-500">
              {monthNames[
                target.month - 1
              ]}{" "}
              {target.year}
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/targets/${target.id}/edit`
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Edit3
              size={17}
            />

            Edit Target
          </button>
        )}
      </div>

      {/* EMPLOYEE */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <User
              size={20}
            />
          }
          title="Employee Information"
          description="Target assigned employee"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Employee"
            value={
              target.employee
                ?.name ||
              "-"
            }
          />

          <InfoCard
            label="Employee Code"
            value={
              target.employee
                ?.employeeCode ||
              "-"
            }
          />

          <InfoCard
            label="Role"
            value={
              target.employee
                ?.role?.name ||
              "-"
            }
          />

          <InfoCard
            label="Branch"
            value={
              target.employee
                ?.branch?.name ||
              "-"
            }
          />
        </div>
      </section>

      {/* TARGET PERIOD */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <CalendarDays
              size={20}
            />
          }
          title="Target Period"
          description="Target cycle runs from 26th to 25th"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Target Month"
            value={`${
              monthNames[
                target.month - 1
              ]
            } ${
              target.year
            }`}
          />

          <InfoCard
            label="Period Start"
            value={
              target.periodStart
                ? formatDate(
                    target.periodStart
                  )
                : "-"
            }
          />

          <InfoCard
            label="Period End"
            value={
              target.periodEnd
                ? formatDate(
                    target.periodEnd
                  )
                : "-"
            }
          />

          <InfoCard
            label="Cycle Rule"
            value="26th → 25th"
          />
        </div>
      </section>

      {/* TARGET VALUES */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <Target
              size={20}
            />
          }
          title="Target Summary"
          description="Assigned monthly targets"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MoneyCard
            label="Brokerage Target"
            value={
              brokerageTarget
            }
          />

          <MoneyCard
            label="Revenue Target"
            value={
              revenueTarget
            }
          />

          <NumberCard
            label="Demat Target"
            value={
              target.dematTarget
            }
          />

          <MoneyCard
            label="Achieved"
            value={
              achieved
            }
          />
        </div>
      </section>

      {/* PROGRESS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <TrendingUp
              size={20}
            />
          }
          title="Performance"
          description="Brokerage target achievement"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MoneyCard
            label="Target"
            value={
              brokerageTarget
            }
          />

          <MoneyCard
            label="Achieved"
            value={
              achieved
            }
          />

          <MoneyCard
            label="Remaining"
            value={
              remaining
            }
          />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-700">
              Overall Progress
            </p>

            <p className="text-xl font-bold text-slate-900">
              {safeProgress.toFixed(
                1
              )}
              %
            </p>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-700 transition-all"
              style={{
                width: `${Math.min(
                  safeProgress,
                  100
                )}%`,
              }}
            />
          </div>

          {safeProgress >=
            100 && (
            <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Target Achieved
            </div>
          )}
        </div>
      </section>

      {/* QUICK INFO */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <Users
              size={20}
            />
          }
          title="Target Metrics"
          description="Monthly target metrics"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NumberCard
            label="Demat Target"
            value={
              target.dematTarget
            }
          />

          <MoneyCard
            label="Revenue Target"
            value={
              revenueTarget
            }
          />

          <MoneyCard
            label="Brokerage Target"
            value={
              brokerageTarget
            }
          />
        </div>
      </section>
    </div>
  );
}

/* ============================
   SECTION HEADER
============================ */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon:
    ReactNode;

  title: string;

  description: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================
   INFO
============================ */

function InfoCard({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================
   MONEY
============================ */

function MoneyCard({
  label,
  value,
}: {
  label: string;

  value:
    | number
    | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <BadgeIndianRupee
          size={15}
          className="text-slate-400"
        />

        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 text-xl font-bold text-slate-900">
        ₹
        {formatMoney(
          value
        )}
      </p>
    </div>
  );
}

/* ============================
   NUMBER
============================ */

function NumberCard({
  label,
  value,
}: {
  label: string;

  value:
    | number
    | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================
   MONEY FORMAT
============================ */

function formatMoney(
  value:
    | number
    | string
) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits:
        2,
    }
  );
}

/* ============================
   DATE FORMAT
============================ */

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* ============================
   MONTHS
============================ */

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];