import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
} from "lucide-react";

import {
  getMonthlyAttendanceReport,
} from "../../services/attendance.service";

import type {
  MonthlyAttendanceReport,
} from "../../types/attendance.types";

import AttendanceMonthlySummary from "./AttendanceMonthlySummary";
import AttendanceCalendar from "./AttendanceCalendar";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

/* ============================
   PROPS
============================ */

type Props = {
  employeeId: string;
};

/* ============================
   CURRENT PAYROLL MONTH

   1st → 25th
   = current month payroll

   26th onward
   = next payroll month

   Example:

   28 Aug 2026
   →
   September 2026 cycle
   26 Aug → 25 Sep
============================ */

const getCurrentPayrollMonth =
  () => {
    const today =
      new Date();

    let month =
      today.getMonth() + 1;

    let year =
      today.getFullYear();

    if (
      today.getDate() >=
      26
    ) {
      month++;

      if (
        month > 12
      ) {
        month = 1;

        year++;
      }
    }

    return {
      month,
      year,
    };
  };

/* ============================
   MONTHS
============================ */

const MONTHS = [
  {
    value: 1,
    label: "January",
  },

  {
    value: 2,
    label: "February",
  },

  {
    value: 3,
    label: "March",
  },

  {
    value: 4,
    label: "April",
  },

  {
    value: 5,
    label: "May",
  },

  {
    value: 6,
    label: "June",
  },

  {
    value: 7,
    label: "July",
  },

  {
    value: 8,
    label: "August",
  },

  {
    value: 9,
    label: "September",
  },

  {
    value: 10,
    label: "October",
  },

  {
    value: 11,
    label: "November",
  },

  {
    value: 12,
    label: "December",
  },
];

/* ============================
   COMPONENT
============================ */

export default function EmployeeAttendanceTab({
  employeeId,
}: Props) {
  /* ============================
     INITIAL CYCLE
  ============================ */

  const initialCycle =
    useMemo(
      () =>
        getCurrentPayrollMonth(),
      []
    );

  /* ============================
     FILTERS
  ============================ */

  const [
    month,
    setMonth,
  ] =
    useState(
      initialCycle.month
    );

  const [
    year,
    setYear,
  ] =
    useState(
      initialCycle.year
    );

  /* ============================
     DATA
  ============================ */

  const [
    data,
    setData,
  ] =
    useState<MonthlyAttendanceReport | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* ============================
     YEARS
  ============================ */

  const years =
    useMemo(() => {
      const currentYear =
        new Date()
          .getFullYear();

      return [
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1,
      ];
    }, []);

  /* ============================
     LOAD REPORT
  ============================ */

  useEffect(() => {
    let active =
      true;

    const loadAttendance =
      async () => {
        if (
          !employeeId
        ) {
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
            await getMonthlyAttendanceReport(
              employeeId,
              month,
              year
            );

          if (!active) {
            return;
          }

          setData(
            response
          );
        } catch (
          error: any
        ) {
          if (!active) {
            return;
          }

          setData(
            null
          );

          setError(
            error?.response
              ?.data
              ?.message ||
              error?.message ||
              "Failed to load attendance"
          );
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      };

    void loadAttendance();

    return () => {
      active =
        false;
    };
  }, [
    employeeId,
    month,
    year,
  ]);

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-5">
      {/* ============================
          FILTER HEADER
      ============================ */}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays
              size={19}
              className="text-blue-700"
            />

            <h3 className="font-semibold text-slate-900">
              Attendance Report
            </h3>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Employee attendance,
            working hours and
            payroll cycle.
          </p>

          <p className="mt-1 text-xs font-medium text-blue-600">
            Attendance cycle:
            26th → 25th
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* PAYROLL MONTH */}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payroll Month
            </label>

            <select
              value={
                month
              }
              onChange={(
                event
              ) =>
                setMonth(
                  Number(
                    event
                      .target
                      .value
                  )
                )
              }
              className="min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {MONTHS.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {
                      item.label
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* PAYROLL YEAR */}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Payroll Year
            </label>

            <select
              value={
                year
              }
              onChange={(
                event
              ) =>
                setYear(
                  Number(
                    event
                      .target
                      .value
                  )
                )
              }
              className="min-w-32 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {years.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ============================
          LOADING
      ============================ */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading employee
            attendance...
          </p>
        </div>
      )}

      {/* ============================
          ERROR
      ============================ */}

      {!loading &&
        error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

      {/* ============================
          SUMMARY
      ============================ */}

      {!loading &&
        !error &&
        data && (
          <>
            <AttendanceMonthlySummary
              report={
                data
              }
            />

            {/* ============================
                26 → 25 CALENDAR
            ============================ */}

            <AttendanceCalendar
              month={
                month
              }
              year={
                year
              }
              cycleStart={
                data.cycleStart
              }
              cycleEnd={
                data.cycleEnd
              }
              attendances={
                data.attendances
              }
            />

            {/* ============================
                RECORD TABLE
            ============================ */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="font-semibold text-slate-900">
                  Attendance
                  Records
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Complete 26th to
                  25th attendance
                  cycle.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <TableHead>
                        Date
                      </TableHead>

                      <TableHead>
                        Check In
                      </TableHead>

                      <TableHead>
                        Check Out
                      </TableHead>

                      <TableHead>
                        Working Hours
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Source
                      </TableHead>

                      <TableHead>
                        Remarks
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {data.attendances.map(
                      (
                        item
                      ) => (
                        <tr
                          key={
                            item.id
                          }
                          className="hover:bg-slate-50/70"
                        >
                          <TableCell>
                            {formatDate(
                              item.attendanceDate
                            )}
                          </TableCell>

                          <TableCell>
                            {formatTime(
                              item.checkIn
                            )}
                          </TableCell>

                          <TableCell>
                            {formatTime(
                              item.checkOut
                            )}
                          </TableCell>

                          <TableCell>
                            {item.workingHours !=
                            null
                              ? `${Number(
                                  item.workingHours
                                ).toFixed(
                                  2
                                )} hrs`
                              : "-"}
                          </TableCell>

                          <td className="whitespace-nowrap px-5 py-4">
                            {item.status ? (
                              <AttendanceStatusBadge
                                status={
                                  item.status
                                }
                              />
                            ) : (
                              <span className="text-sm text-slate-400">
                                Upcoming
                              </span>
                            )}
                          </td>

                          <TableCell>
                            {formatSource(
                              item.source
                            )}
                          </TableCell>

                          <TableCell>
                            {item.remarks ||
                              "-"}
                          </TableCell>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {data.attendances
                .length ===
                0 && (
                <div className="p-10 text-center">
                  <CalendarDays
                    size={34}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No attendance
                    records
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No attendance
                    data found for
                    selected payroll
                    cycle.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}

/* ============================
   TABLE HEAD
============================ */

function TableHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ============================
   TABLE CELL
============================ */

function TableCell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
      {children}
    </td>
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
    new Date(
      year,
      month - 1,
      day
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

/* ============================
   FORMAT TIME
============================ */

function formatTime(
  value?:
    | string
    | null
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );
}

/* ============================
   SOURCE
============================ */

function formatSource(
  value?:
    | string
    | null
) {
  switch (value) {
    case "ATTENDANCE":
      return "Check-In";

    case "HOLIDAY":
      return "Holiday";

    case "WEEK_OFF":
      return "Weekly Off";

    case "LEAVE":
      return "Approved Leave";

    case "SYSTEM":
      return "System";

    case "FUTURE":
      return "Upcoming";

    default:
      return "-";
  }
}