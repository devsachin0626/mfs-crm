import {
  useEffect,
  useState,
} from "react";

import {
  Eye,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getPayrolls,
} from "../../services/payroll.service";

import type {
  Payroll,
} from "../../types/payroll.types";

import PayrollStatusBadge from "./PayrollStatusBadge";

/* ============================
   PROPS
============================ */

type Props = {
  employeeId: string;
};

/* ============================
   COMPONENT
============================ */

export default function EmployeePayrollTab({
  employeeId,
}: Props) {
  const navigate =
    useNavigate();

  const [
    payrolls,
    setPayrolls,
  ] =
    useState<Payroll[]>(
      []
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
     LOAD PAYROLLS
  ============================ */

  useEffect(() => {
    let active =
      true;

    const loadPayrolls =
      async () => {
        if (
          !employeeId
        ) {
          setPayrolls(
            []
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
            await getPayrolls({
              page: 1,

              limit: 100,

              employeeId,
            });

          if (!active) {
            return;
          }

          setPayrolls(
            response.payrolls ||
              []
          );
        } catch (
          error: any
        ) {
          if (!active) {
            return;
          }

          setPayrolls(
            []
          );

          setError(
            error?.response
              ?.data
              ?.message ||
              error?.message ||
              "Failed to load payroll"
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

    void loadPayrolls();

    return () => {
      active =
        false;
    };
  }, [
    employeeId,
  ]);

  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

        <p className="mt-3 text-sm font-medium text-slate-500">
          Loading employee payroll...
        </p>
      </div>
    );
  }

  /* ============================
     ERROR
  ============================ */

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  /* ============================
     EMPTY
  ============================ */

  if (
    payrolls.length ===
    0
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-600">
          No payroll records found
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Payroll records for this
          employee will appear here.
        </p>
      </div>
    );
  }

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ============================
          HEADER
      ============================ */}

      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-semibold text-slate-900">
          Payroll History
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Employee salary history •
          Payroll cycle 26th → 25th
        </p>
      </div>

      {/* ============================
          TABLE
      ============================ */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-287.5">
          <thead className="bg-slate-50">
            <tr>
              <TableHead>
                Payroll Month
              </TableHead>

              <TableHead>
                Period
              </TableHead>

              <TableHead>
                Basic
              </TableHead>

              <TableHead>
                Gross
              </TableHead>

              <TableHead>
                Incentive
              </TableHead>

              <TableHead>
                Bonus
              </TableHead>

              <TableHead>
                Deduction
              </TableHead>

              <TableHead>
                Net Salary
              </TableHead>

              <TableHead>
                Status
              </TableHead>

              <TableHead
                align="right"
              >
                Action
              </TableHead>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
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
                    className="transition hover:bg-slate-50/70"
                  >
                    {/* MONTH */}

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
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
                    </td>

                    {/* PERIOD */}

                    <td className="px-5 py-4">
                      {payroll.periodStart &&
                      payroll.periodEnd ? (
                        <div className="whitespace-nowrap">
                          <p className="text-sm text-slate-700">
                            {formatDate(
                              payroll.periodStart
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            to{" "}
                            {formatDate(
                              payroll.periodEnd
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          -
                        </span>
                      )}
                    </td>

                    {/* BASIC */}

                    <MoneyCell
                      value={
                        payroll.basicSalary
                      }
                    />

                    {/* GROSS */}

                    <MoneyCell
                      value={
                        payroll.grossSalary
                      }
                    />

                    {/* INCENTIVE */}

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

                    {/* BONUS */}

                    <MoneyCell
                      value={
                        payroll.bonus
                      }
                      positive={
                        Number(
                          payroll.bonus ||
                            0
                        ) > 0
                      }
                    />

                    {/* DEDUCTION */}

                    <td className="px-5 py-4">
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
                    </td>

                    {/* NET */}

                    <MoneyCell
                      value={
                        payroll.netSalary
                      }
                      bold
                    />

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <PayrollStatusBadge
                        status={
                          payroll.status
                        }
                      />
                    </td>

                    {/* VIEW */}

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
          value
        )}
      </span>
    </td>
  );
}

/* ============================
   MONEY
============================ */

function formatMoney(
  value:
    | number
    | string
    | null
    | undefined
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

function formatDate(
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

      year: "numeric",
    }
  );
}