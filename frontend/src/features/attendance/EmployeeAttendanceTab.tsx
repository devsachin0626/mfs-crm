import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  Timer,
  UserMinus,
  XCircle,
} from "lucide-react";

import {
  getMonthlyAttendanceReport,
} from "../../services/attendance.service";

import type {
  MonthlyAttendanceReport,
} from "../../types/attendance.types";

import AttendanceStatusBadge from "../attendance/AttendanceStatusBadge";

type Props = {
  employeeId: string;
};

export default function EmployeeAttendanceTab({
  employeeId,
}: Props) {
  const today = new Date();

  const [month, setMonth] =
    useState(today.getMonth() + 1);

  const [year, setYear] =
    useState(today.getFullYear());

  const [data, setData] =
    useState<MonthlyAttendanceReport | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getMonthlyAttendanceReport(
            employeeId,
            month,
            year
          );

        setData(response);
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load attendance"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [
    employeeId,
    month,
    year,
  ]);

  const summary = data?.summary;

  return (
    <div className="space-y-5">

      {/* Filters */}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            Attendance Report
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Monthly attendance and working
            hours
          </p>
        </div>

        <div className="flex gap-3">

          <select
            value={month}
            onChange={(e) =>
              setMonth(
                Number(e.target.value)
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value={1}>
              January
            </option>

            <option value={2}>
              February
            </option>

            <option value={3}>
              March
            </option>

            <option value={4}>
              April
            </option>

            <option value={5}>
              May
            </option>

            <option value={6}>
              June
            </option>

            <option value={7}>
              July
            </option>

            <option value={8}>
              August
            </option>

            <option value={9}>
              September
            </option>

            <option value={10}>
              October
            </option>

            <option value={11}>
              November
            </option>

            <option value={12}>
              December
            </option>
          </select>

          <select
            value={year}
            onChange={(e) =>
              setYear(
                Number(e.target.value)
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            {[
              today.getFullYear() - 2,
              today.getFullYear() - 1,
              today.getFullYear(),
              today.getFullYear() + 1,
            ].map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading attendance...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        summary && (
          <>
            {/* Summary Cards */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Present"
                value={summary.present}
                icon={
                  <CheckCircle2
                    size={19}
                  />
                }
              />

              <SummaryCard
                title="Late"
                value={summary.late}
                icon={
                  <Clock3 size={19} />
                }
              />

              <SummaryCard
                title="Half Day"
                value={summary.halfDay}
                icon={
                  <Timer size={19} />
                }
              />

              <SummaryCard
                title="Absent"
                value={summary.absent}
                icon={
                  <XCircle size={19} />
                }
              />

              <SummaryCard
                title="Leave"
                value={summary.leave}
                icon={
                  <UserMinus
                    size={19}
                  />
                }
              />

              <SummaryCard
                title="Holiday"
                value={summary.holiday}
                icon={
                  <Coffee size={19} />
                }
              />

              <SummaryCard
                title="Records"
                value={
                  summary.totalRecords
                }
                icon={
                  <CalendarDays
                    size={19}
                  />
                }
              />

              <SummaryCard
                title="Working Hours"
                value={`${summary.totalWorkingHours} hrs`}
                icon={
                  <Timer size={19} />
                }
              />
            </div>

            {/* Attendance Table */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-semibold text-slate-900">
                  Attendance Records
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
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
                        Remarks
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {data.attendances.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-100 hover:bg-slate-50"
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
                              ? `${item.workingHours} hrs`
                              : "-"}
                          </TableCell>

                          <td className="px-5 py-4">
                            <AttendanceStatusBadge
                              status={
                                item.status
                              }
                            />
                          </td>

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
                .length === 0 && (
                <div className="p-10 text-center">
                  <CalendarDays
                    size={34}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No attendance records
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No attendance found
                    for selected month.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-5 py-4 text-sm text-slate-700">
      {children}
    </td>
  );
}

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(
  value?: string | null
) {
  if (!value) return "-";

  return new Date(
    value
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}