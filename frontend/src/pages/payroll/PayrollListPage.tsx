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

export default function PayrollListPage() {
  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

  const now = new Date();

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [month, setMonth] =
    useState(
      now.getMonth() + 1
    );

  const [year, setYear] =
    useState(
      now.getFullYear()
    );

  const [status, setStatus] =
    useState("");

  const {
    payrolls,
    loading,
    error,
    totalPages,
  } = useAppSelector(
    (state) => state.payroll
  );

  useEffect(() => {
    dispatch(
      fetchPayrolls({
        page,
        limit: 10,
        search:
          search || undefined,
        month,
        year,
        status:
          status || undefined,
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

  const summary =
    useMemo(() => {
      return payrolls.reduce(
        (acc, item) => {
          acc.gross += Number(
            item.grossSalary
          );

          acc.incentive += Number(
            item.incentive
          );

          acc.deduction += Number(
            item.deduction
          );

          acc.net += Number(
            item.netSalary
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
    }, [payrolls]);

  return (
    <div className="space-y-6">
      {/* Header */}

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

            <p className="text-sm text-slate-500">
              Manage monthly employee payroll
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/payroll/create"
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={18} />
          Create Payroll
        </button>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Gross Salary"
          value={summary.gross}
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
          title="Deduction"
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
          value={summary.net}
          icon={
            <Banknote
              size={20}
            />
          }
        />
      </div>

      <PayrollFilters
        search={search}
        month={month}
        year={year}
        status={status}
        onSearchChange={(
          value
        ) => {
          setPage(1);
          setSearch(value);
        }}
        onMonthChange={(
          value
        ) => {
          setPage(1);
          setMonth(value);
        }}
        onYearChange={(
          value
        ) => {
          setPage(1);
          setYear(value);
        }}
        onStatusChange={(
          value
        ) => {
          setPage(1);
          setStatus(value);
        }}
      />

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          Loading payroll...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !error && (
          <PayrollTable
            payrolls={
              payrolls
            }
          />
        )}

      {!loading &&
        !error &&
        totalPages > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-sm text-slate-500">
              Page {page} of{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
                className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
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
            ₹
            {value.toLocaleString(
              "en-IN"
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