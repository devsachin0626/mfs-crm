import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  Plus,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchPayrolls,
} from "../../store/slices/payrollSlice";

import PayrollFilters from "../../features/payroll/PayrollFilters";
import PayrollTable from "../../features/payroll/PayrollTable";

/* ============================
   PAGE
============================ */

export default function PayrollListPage() {
  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

  const now =
    new Date();

  /* ============================
     AUTH
  ============================ */

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const roleName =
    useMemo(() => {
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
    }, [
      employee,
    ]);

  const canManagePayroll =
    roleName ===
      "ADMIN" ||
    roleName ===
      "HR";

  /* ============================
     FILTER STATE
  ============================ */

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    month,
    setMonth,
  ] =
    useState(
      now.getMonth() + 1
    );

  const [
    year,
    setYear,
  ] =
    useState(
      now.getFullYear()
    );

  const [
    status,
    setStatus,
  ] =
    useState("");

  /* ============================
     REDUX
  ============================ */

  const {
    payrolls,
    loading,
    error,
    total,
    totalPages,
  } =
    useAppSelector(
      (state) =>
        state.payroll
    );

  /* ============================
     LOAD PAYROLLS
  ============================ */

  useEffect(() => {
    dispatch(
      fetchPayrolls({
        page,

        limit: 10,

        search:
          search.trim() ||
          undefined,

        month,

        year,

        status:
          status ||
          undefined,
      })
    );
  }, [
    dispatch,
    page,
    search,
    month,
    year,
    status,
  ]);

  /* ============================
     SUMMARY
  ============================ */

  const summary =
    useMemo(() => {
      return payrolls.reduce(
        (
          acc,
          item
        ) => {
          acc.gross +=
            Number(
              item.grossSalary ||
                0
            );

          acc.incentive +=
            Number(
              item.incentive ||
                0
            );

          acc.deduction +=
            Number(
              item.deduction ||
                0
            ) +
            Number(
              item.lateDeduction ||
                0
            );

          acc.net +=
            Number(
              item.netSalary ||
                0
            );

          return acc;
        },

        {
          gross: 0,

          incentive: 0,

          deduction: 0,

          net: 0,
        }
      );
    }, [
      payrolls,
    ]);

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="space-y-6">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <Banknote
              size={24}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payroll
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage employee payroll
              • Cycle 26th → 25th
            </p>
          </div>
        </div>

        {/* CREATE */}

        {canManagePayroll && (
          <button
            type="button"
            onClick={() =>
              navigate(
                "/payroll/create"
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            <Plus
              size={18}
            />

            Create Payroll
          </button>
        )}
      </div>

      {/* ============================
          VIEW ONLY NOTICE
      ============================ */}

      {!canManagePayroll && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Payroll View Only
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Payroll creation and
            management are available
            only to Admin and HR.
          </p>
        </div>
      )}

      {/* ============================
          SUMMARY
      ============================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Gross Salary"
          value={
            summary.gross
          }
          icon={
            <WalletCards
              size={20}
            />
          }
        />

        <StatCard
          title="Incentive"
          value={
            summary.incentive
          }
          icon={
            <TrendingUp
              size={20}
            />
          }
        />

        <StatCard
          title="Total Deduction"
          value={
            summary.deduction
          }
          icon={
            <TrendingDown
              size={20}
            />
          }
        />

        <StatCard
          title="Net Payroll"
          value={
            summary.net
          }
          icon={
            <Banknote
              size={20}
            />
          }
        />
      </div>

      {/* ============================
          SUMMARY INFO
      ============================ */}

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-blue-800">
            Selected Payroll Month
          </p>

          <p className="text-xs text-blue-600">
            {monthNames[
              month - 1
            ]}{" "}
            {year}
          </p>
        </div>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Payroll uses the 26th of
          the previous month through
          the 25th of the selected
          payroll month.
        </p>
      </div>

      {/* ============================
          FILTERS
      ============================ */}

      <PayrollFilters
        search={
          search
        }
        month={
          month
        }
        year={
          year
        }
        status={
          status
        }
        onSearchChange={(
          value
        ) => {
          setPage(1);

          setSearch(
            value
          );
        }}
        onMonthChange={(
          value
        ) => {
          setPage(1);

          setMonth(
            value
          );
        }}
        onYearChange={(
          value
        ) => {
          setPage(1);

          setYear(
            value
          );
        }}
        onStatusChange={(
          value
        ) => {
          setPage(1);

          setStatus(
            value
          );
        }}
      />

      {/* ============================
          RESULT COUNT
      ============================ */}

      {!loading &&
        !error && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Payroll Records:{" "}
              <span className="font-semibold text-slate-700">
                {
                  total
                }
              </span>
            </p>
          </div>
        )}

      {/* ============================
          LOADING
      ============================ */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading payroll...
          </p>
        </div>
      )}

      {/* ============================
          ERROR
      ============================ */}

      {!loading &&
        error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

      {/* ============================
          TABLE
      ============================ */}

      {!loading &&
        !error && (
          <PayrollTable
            payrolls={
              payrolls
            }
          />
        )}

      {/* ============================
          PAGINATION
      ============================ */}

      {!loading &&
        !error &&
        totalPages >
          0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-700">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {
                  totalPages
                }
              </span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.max(
                        current -
                          1,
                        1
                      )
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      current +
                      1
                  )
                }
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

/* ============================
   STAT CARD
============================ */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;

  value: number;

  icon:
    React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            ₹
            {formatMoney(
              value
            )}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================
   MONEY
============================ */

function formatMoney(
  value: number
) {
  return Number(
    value || 0
  ).toLocaleString(
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