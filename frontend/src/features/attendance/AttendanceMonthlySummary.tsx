import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  UserMinus,
  Umbrella,
  CalendarOff,
  Banknote,
  Timer,
} from "lucide-react";

import type {
  MonthlyAttendanceReport,
} from "../../types/attendance.types";

type Props = {
  report:
    | MonthlyAttendanceReport
    | null;

  loading?: boolean;
};

export default function AttendanceMonthlySummary({
  report,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

        <p className="mt-3 text-sm text-slate-500">
          Loading monthly summary...
        </p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const {
    summary,
  } = report;

  const cards = [
    {
      title: "Present",
      value:
        summary.present,
      icon:
        CheckCircle2,
    },

    {
      title: "Late",
      value:
        summary.late,
      icon:
        Clock3,
    },

    {
      title: "Half Day",
      value:
        summary.halfDay,
      icon:
        UserMinus,
    },

    {
      title: "Leave",
      value:
        summary.leave,
      icon:
        Umbrella,
    },

    {
      title: "Absent",
      value:
        summary.absent,
      icon:
        CalendarOff,
    },

    {
      title: "Holiday",
      value:
        summary.holiday,
      icon:
        CalendarDays,
    },

    {
      title: "Payable Days",
      value:
        summary.payableDays,
      icon:
        Banknote,
    },

    {
      title: "Working Hours",
      value:
        summary.totalWorkingHours,
      icon:
        Timer,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Monthly Summary
        </h2>

        <p className="text-sm text-slate-500">
          {report.employee.name} ·{" "}
          {report.month}/{report.year}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.title
                }
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {
                        item.title
                      }
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {
                        item.value
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <Icon
                      size={
                        20
                      }
                    />
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}