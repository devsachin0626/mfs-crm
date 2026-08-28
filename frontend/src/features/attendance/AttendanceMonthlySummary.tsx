import {
  Banknote,
  CalendarDays,
  CalendarOff,
  CheckCircle2,
  Clock3,
  Timer,
  Umbrella,
  UserMinus,
} from "lucide-react";

import type {
  MonthlyAttendanceReport,
} from "../../types/attendance.types";

/* ============================
   PROPS
============================ */

type Props = {
  report:
    | MonthlyAttendanceReport
    | null;

  loading?: boolean;
};

/* ============================
   COMPONENT
============================ */

export default function AttendanceMonthlySummary({
  report,
  loading = false,
}: Props) {
  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

        <p className="mt-3 text-sm font-medium text-slate-500">
          Loading attendance
          summary...
        </p>
      </div>
    );
  }

  /* ============================
     EMPTY
  ============================ */

  if (!report) {
    return null;
  }

  const {
    summary,
  } = report;

  /* ============================
     CARDS
  ============================ */

  const cards = [
    {
      title:
        "Present",

      value:
        summary.present,

      subtext:
        "Full present days",

      icon:
        CheckCircle2,
    },

    {
      title:
        "Late",

      value:
        summary.late,

      subtext:
        "Late attendance",

      icon:
        Clock3,
    },

    {
      title:
        "Half Day",

      value:
        summary.halfDay,

      subtext:
        "Half payable days",

      icon:
        UserMinus,
    },

    {
      title:
        "Absent",

      value:
        summary.absent,

      subtext:
        "Unpaid absent days",

      icon:
        CalendarOff,
    },

    {
      title:
        "Leave",

      value:
        summary.leave,

      subtext:
        "Approved leave days",

      icon:
        Umbrella,
    },

    {
      title:
        "Holiday",

      value:
        summary.holiday,

      subtext:
        "Holiday / weekly off",

      icon:
        CalendarDays,
    },

    {
      title:
        "Working Days",

      value:
        summary.workingDays,

      subtext:
        "Attendance working days",

      icon:
        CalendarDays,
    },

    {
      title:
        "Payable Days",

      value:
        formatNumber(
          summary.payableDays
        ),

      subtext:
        "Payroll payable days",

      icon:
        Banknote,
    },

    {
      title:
        "Working Hours",

      value:
        `${formatNumber(
          summary.totalWorkingHours
        )} hrs`,

      subtext:
        "Recorded working hours",

      icon:
        Timer,
    },
  ];

  return (
    <div className="space-y-4">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Attendance Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {
              report.employee.name
            }{" "}
            ·{" "}
            {
              report.employee
                .employeeCode
            }
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
            Payroll Cycle
          </p>

          <p className="mt-0.5 text-sm font-semibold text-blue-800">
            {formatDate(
              report.cycleStart
            )}{" "}
            —{" "}
            {formatDate(
              report.cycleEnd
            )}
          </p>
        </div>
      </div>

      {/* ============================
          MAIN METRICS
      ============================ */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.title
                }
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {
                        item.title
                      }
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {
                        item.value
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        item.subtext
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <Icon
                      size={20}
                    />
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ============================
          PAYROLL BREAKDOWN
      ============================ */}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* PAYABLE */}

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">
            Payable Days
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-900">
            {formatNumber(
              summary.payableDays
            )}
          </p>

          <p className="mt-2 text-xs leading-5 text-emerald-700">
            Present + Late +
            Half Day × 0.5 +
            Leave + Holiday
          </p>
        </div>

        {/* NON PAYABLE */}

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-800">
            Non-Payable
            Attendance
          </p>

          <p className="mt-2 text-3xl font-bold text-red-900">
            {formatNumber(
              summary.absent +
                summary.halfDay *
                  0.5
            )}
          </p>

          <p className="mt-2 text-xs leading-5 text-red-700">
            Absent days +
            unpaid half-day
            portion
          </p>
        </div>

        {/* RECORDS */}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-700">
            Cycle Records
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              summary.totalRecords
            }
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Complete dates in
            selected 26 → 25
            attendance cycle
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================
   FORMAT NUMBER
============================ */

function formatNumber(
  value: number
) {
  return Number(
    value
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits:
        2,
    }
  );
}

/* ============================
   FORMAT DATE
============================ */

function formatDate(
  value: string
) {
  const datePart =
    value.slice(
      0,
      10
    );

  const [
    year,
    month,
    day,
  ] =
    datePart
      .split("-")
      .map(
        Number
      );

  const date =
    Number.isInteger(
      year
    ) &&
    Number.isInteger(
      month
    ) &&
    Number.isInteger(
      day
    )
      ? new Date(
          year,
          month - 1,
          day
        )
      : new Date(
          value
        );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
}