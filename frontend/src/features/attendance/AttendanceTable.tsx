import {
  Eye,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  Attendance,
} from "../../types/attendance.types";

import AttendanceStatusBadge from "./AttendanceStatusBadge";

/* ============================
   PROPS
============================ */

type Props = {
  attendances:
    Attendance[];
};

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
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
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
    new Date(
      value
    );

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
   FORMAT HOURS
============================ */

function formatHours(
  value?:
    | number
    | string
    | null
) {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      ""
  ) {
    return "-";
  }

  const parsed =
    Number(
      value
    );

  if (
    Number.isNaN(
      parsed
    )
  ) {
    return "-";
  }

  return `${parsed.toFixed(
    2
  )} hrs`;
}

/* ============================
   TABLE
============================ */

export default function AttendanceTable({
  attendances,
}: Props) {
  const navigate =
    useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <TableHead>
                Employee
              </TableHead>

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
                Hours
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead>
                Remarks
              </TableHead>

              <TableHead
                align="right"
              >
                Action
              </TableHead>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {attendances.map(
              (
                attendance
              ) => (
                <tr
                  key={
                    attendance.id
                  }
                  className="transition hover:bg-slate-50/70"
                >
                  {/* EMPLOYEE */}

                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {attendance
                        .employee
                        ?.name ||
                        "-"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {attendance
                        .employee
                        ?.employeeCode ||
                        "-"}
                    </p>
                  </td>

                  {/* DATE */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    {formatDate(
                      attendance.attendanceDate
                    )}
                  </td>

                  {/* CHECK IN */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    {formatTime(
                      attendance.checkIn
                    )}
                  </td>

                  {/* CHECK OUT */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    {formatTime(
                      attendance.checkOut
                    )}
                  </td>

                  {/* HOURS */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700">
                    {formatHours(
                      attendance.workingHours
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="whitespace-nowrap px-5 py-4">
                    {attendance.status ? (
                      <AttendanceStatusBadge
                        status={
                          attendance.status
                        }
                      />
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        Upcoming
                      </span>
                    )}
                  </td>

                  {/* REMARKS */}

                  <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                    <p className="line-clamp-2">
                      {attendance.remarks ||
                        "-"}
                    </p>
                  </td>

                  {/* ACTION */}

                  <td className="px-5 py-4 text-right">
                    {attendance.source &&
                    attendance.source !==
                      "ATTENDANCE" ? (
                      <span className="text-xs font-medium text-slate-400">
                        System
                        Record
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/attendance/${attendance.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <Eye
                          size={16}
                        />

                        View
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* EMPTY */}

      {attendances.length ===
        0 && (
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            No attendance
            records found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try changing the
            payroll month,
            employee or status
            filter.
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================
   TABLE HEAD
============================ */

function TableHead({
  children,
  align = "left",
}: {
  children:
    React.ReactNode;

  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align ===
        "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}