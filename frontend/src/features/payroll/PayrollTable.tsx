import {
  Eye,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  Payroll,
} from "../../types/payroll.types";

import PayrollStatusBadge from "./PayrollStatusBadge";

/* ============================
   TYPES
============================ */

type Props = {
  payrolls: Payroll[];
};

/* ============================
   TABLE
============================ */

export default function PayrollTable({
  payrolls,
}: Props) {
  const navigate =
    useNavigate();

  /* ============================
     EMPTY
  ============================ */

  if (
    payrolls.length === 0
  ) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="p-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            No payroll records found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try changing the payroll
            month, year or status
            filter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-300">
          {/* ============================
              HEADER
          ============================ */}

          <thead className="bg-slate-50">
            <tr>
              <TableHeader>
                Employee
              </TableHeader>

              <TableHeader>
                Payroll Period
              </TableHeader>

              <TableHeader>
                Basic
              </TableHeader>

              <TableHeader>
                Gross
              </TableHeader>

              <TableHeader>
                Incentive
              </TableHeader>

              <TableHeader>
                Bonus
              </TableHeader>

              <TableHeader>
                Deduction
              </TableHeader>

              <TableHeader>
                Net Salary
              </TableHeader>

              <TableHeader>
                Status
              </TableHeader>

              <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          {/* ============================
              BODY
          ============================ */}

          <tbody>
            {payrolls.map(
              (
                payroll
              ) => {
                const totalDeduction =
                  Number(
                    payroll.deduction ||
                      0
                  ) +
                  Number(
                    payroll.lateDeduction ||
                      0
                  );

                return (
                  <tr
                    key={
                      payroll.id
                    }
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    {/* ============================
                        EMPLOYEE
                    ============================ */}

                    <td className="px-5 py-4">
                      <div className="min-w-42.5">
                        <p className="font-semibold text-slate-900">
                          {payroll
                            .employee
                            ?.name ||
                            "-"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {payroll
                            .employee
                            ?.employeeCode ||
                            "-"}
                        </p>

                        {payroll
                          .employee
                          ?.role
                          ?.name && (
                          <p className="mt-1 text-xs text-slate-400">
                            {
                              payroll
                                .employee
                                .role
                                .name
                            }
                          </p>
                        )}
                      </div>
                    </td>

                    {/* ============================
                        PAYROLL PERIOD
                    ============================ */}

                    <td className="px-5 py-4">
                      <div className="min-w-36.25">
                        <p className="text-sm font-medium text-slate-700">
                          {getMonthName(
                            payroll.month
                          )}{" "}
                          {
                            payroll.year
                          }
                        </p>

                        <p className="mt-1 text-xs font-medium text-blue-600">
                          26th → 25th
                        </p>

                        {payroll.periodStart &&
                          payroll.periodEnd && (
                            <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                              {formatShortDate(
                                payroll.periodStart
                              )}{" "}
                              -{" "}
                              {formatShortDate(
                                payroll.periodEnd
                              )}
                            </p>
                          )}
                      </div>
                    </td>

                    {/* ============================
                        BASIC
                    ============================ */}

                    <MoneyCell
                      value={
                        payroll.basicSalary
                      }
                    />

                    {/* ============================
                        GROSS
                    ============================ */}

                    <MoneyCell
                      value={
                        payroll.grossSalary
                      }
                    />

                    {/* ============================
                        INCENTIVE
                    ============================ */}

                    <MoneyCell
                      value={
                        payroll.incentive
                      }
                      positive={
                        Number(
                          payroll.incentive ||
                            0
                        ) > 0
                      }
                    />

                    {/* ============================
                        BONUS
                    ============================ */}

                    <MoneyCell
                      value={
                        payroll.bonus ||
                        0
                      }
                      positive={
                        Number(
                          payroll.bonus ||
                            0
                        ) > 0
                      }
                    />

                    {/* ============================
                        DEDUCTION
                    ============================ */}

                    <td className="px-5 py-4">
                      <div className="min-w-26.25">
                        <p
                          className={`whitespace-nowrap text-sm font-medium ${
                            totalDeduction >
                            0
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          ₹
                          {formatMoney(
                            totalDeduction
                          )}
                        </p>

                        {Number(
                          payroll.lateDeduction ||
                            0
                        ) > 0 && (
                          <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                            Late: ₹
                            {formatMoney(
                              payroll.lateDeduction ||
                                0
                            )}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* ============================
                        NET SALARY
                    ============================ */}

                    <MoneyCell
                      value={
                        payroll.netSalary
                      }
                      bold
                    />

                    {/* ============================
                        STATUS
                    ============================ */}

                    <td className="px-5 py-4">
                      <PayrollStatusBadge
                        status={
                          payroll.status
                        }
                      />
                    </td>

                    {/* ============================
                        ACTION
                    ============================ */}

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/payroll/${payroll.id}`
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
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================
   TABLE HEADER
============================ */

function TableHeader({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ============================
   MONEY CELL
============================ */

function MoneyCell({
  value,
  bold = false,
  positive = false,
}: {
  value:
    | number
    | string
    | null
    | undefined;

  bold?: boolean;

  positive?: boolean;
}) {
  const amount =
    Number(
      value ||
        0
    );

  return (
    <td className="whitespace-nowrap px-5 py-4">
      <span
        className={`text-sm ${
          bold
            ? "font-bold text-slate-950"
            : positive
              ? "font-semibold text-emerald-700"
              : "font-medium text-slate-700"
        }`}
      >
        ₹
        {formatMoney(
          amount
        )}
      </span>
    </td>
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
  const amount =
    Number(
      value ||
        0
    );

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "0";
  }

  return amount.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    }
  );
}

/* ============================
   MONTH
============================ */

function getMonthName(
  month: number
) {
  if (
    month < 1 ||
    month > 12
  ) {
    return "-";
  }

  return new Date(
    2000,
    month - 1,
    1
  ).toLocaleString(
    "en-IN",
    {
      month: "long",
    }
  );
}

/* ============================
   DATE
============================ */

function formatShortDate(
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

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "2-digit",
    }
  );
}