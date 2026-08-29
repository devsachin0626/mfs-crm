import {
  Eye,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  Leave,
} from "../../types/leave.types";

import LeaveStatusBadge from "./LeaveStatusBadge";

/* ============================
   PROPS
============================ */

type Props = {
  leaves:
    Leave[];
};

/* ============================
   COMPONENT
============================ */

export default function LeaveTable({
  leaves,
}: Props) {
  const navigate =
    useNavigate();

  /* ============================
     EMPTY
  ============================ */

  if (
    leaves.length === 0
  ) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-10 text-center">
          <p className="text-sm font-semibold text-slate-600">
            No leave requests found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try changing the employee
            or leave status filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-262.5">
          {/* ============================
              HEADER
          ============================ */}

          <thead className="bg-slate-50">
            <tr>
              <TableHead>
                Employee
              </TableHead>

              <TableHead>
                From
              </TableHead>

              <TableHead>
                To
              </TableHead>

              <TableHead>
                Calendar Days
              </TableHead>

              <TableHead>
                Reason
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead>
                Approved By
              </TableHead>

              <TableHead
                align="right"
              >
                Action
              </TableHead>
            </tr>
          </thead>

          {/* ============================
              BODY
          ============================ */}

          <tbody className="divide-y divide-slate-100">
            {leaves.map(
              (
                leave
              ) => (
                <tr
                  key={
                    leave.id
                  }
                  className="transition hover:bg-slate-50/70"
                >
                  {/* ============================
                      EMPLOYEE
                  ============================ */}

                  <td className="px-5 py-4">
                    <div className="min-w-40">
                      <p className="font-semibold text-slate-900">
                        {leave.employee
                          ?.name ||
                          "-"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {leave.employee
                          ?.employeeCode ||
                          "-"}
                      </p>

                      {leave.employee
                        ?.mobile && (
                        <p className="mt-1 text-xs text-slate-400">
                          {
                            leave.employee
                              .mobile
                          }
                        </p>
                      )}
                    </div>
                  </td>

                  {/* ============================
                      FROM
                  ============================ */}

                  <TableCell>
                    {formatDate(
                      leave.fromDate
                    )}
                  </TableCell>

                  {/* ============================
                      TO
                  ============================ */}

                  <TableCell>
                    {formatDate(
                      leave.toDate
                    )}
                  </TableCell>

                  {/* ============================
                      CALENDAR DAYS
                  ============================ */}

                  <TableCell>
                    {calculateCalendarDays(
                      leave.fromDate,
                      leave.toDate
                    )}
                  </TableCell>

                  {/* ============================
                      REASON
                  ============================ */}

                  <td className="max-w-75 px-5 py-4">
                    <p
                      title={
                        leave.reason ||
                        undefined
                      }
                      className="line-clamp-2 text-sm leading-5 text-slate-700"
                    >
                      {leave.reason ||
                        "-"}
                    </p>
                  </td>

                  {/* ============================
                      STATUS
                  ============================ */}

                  <td className="whitespace-nowrap px-5 py-4">
                    <LeaveStatusBadge
                      status={
                        leave.status
                      }
                    />
                  </td>

                  {/* ============================
                      APPROVER
                  ============================ */}

                  <td className="px-5 py-4">
                    {leave.approvedBy ? (
                      <div className="min-w-35">
                        <p className="text-sm font-medium text-slate-700">
                          {
                            leave
                              .approvedBy
                              .name
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {
                            leave
                              .approvedBy
                              .employeeCode
                          }
                        </p>
                      </div>
                    ) : leave.status ===
                      "PENDING" ? (
                      <span className="text-sm text-amber-600">
                        Awaiting Approval
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        -
                      </span>
                    )}
                  </td>

                  {/* ============================
                      ACTION
                  ============================ */}

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/leaves/${leave.id}`
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye
                        size={16}
                      />

                      View
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ============================
          FOOT NOTE
      ============================ */}

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Calendar Days represent the
          complete requested date range.
          Payroll calculates applicable
          working leave days separately
          after weekly offs and company
          holidays.
        </p>
      </div>
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
  if (!value) {
    return "-";
  }

  /*
   * Avoid timezone shifting
   * for YYYY-MM-DD / ISO dates.
   */

  const raw =
    value.slice(
      0,
      10
    );

  const [
    year,
    month,
    day,
  ] =
    raw
      .split("-")
      .map(
        Number
      );

  if (
    !year ||
    !month ||
    !day
  ) {
    return "-";
  }

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
   CALENDAR DAYS

   IMPORTANT:
   This is NOT payroll payable
   leave days.

   Example:
   Fri → Mon = 4 calendar days.

   Payroll may exclude:
   - Sunday
   - First Saturday
   - Company Holiday
============================ */

function calculateCalendarDays(
  fromDate: string,
  toDate: string
) {
  const from =
    parseLocalDate(
      fromDate
    );

  const to =
    parseLocalDate(
      toDate
    );

  if (
    !from ||
    !to
  ) {
    return "-";
  }

  if (
    to <
    from
  ) {
    return "-";
  }

  const millisecondsPerDay =
    1000 *
    60 *
    60 *
    24;

  const difference =
    Math.round(
      (
        to.getTime() -
        from.getTime()
      ) /
        millisecondsPerDay
    );

  return difference + 1;
}

/* ============================
   LOCAL DATE
============================ */

function parseLocalDate(
  value: string
) {
  if (!value) {
    return null;
  }

  const raw =
    value.slice(
      0,
      10
    );

  const [
    year,
    month,
    day,
  ] =
    raw
      .split("-")
      .map(
        Number
      );

  if (
    !year ||
    !month ||
    !day
  ) {
    return null;
  }

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
    return null;
  }

  return date;
}