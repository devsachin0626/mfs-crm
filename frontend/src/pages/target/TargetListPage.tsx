import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Target,
  TrendingUp,
  Users,
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
  fetchTargets,
} from "../../store/slices/targetSlice";

import TargetFilters from "../../features/target/TargetFilters";
import TargetTable from "../../features/target/TargetTable";

export default function TargetListPage() {
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

  const {
    targets,
    loading,
    error,
    total,
    totalPages,
  } = useAppSelector(
    (state) => state.target
  );

  useEffect(() => {
    dispatch(
      fetchTargets({
        page,
        limit: 10,
        search:
          search || undefined,
        month,
        year,
      })
    );
  }, [
    dispatch,
    page,
    search,
    month,
    year,
  ]);

  const summary =
    useMemo(() => {
      return targets.reduce(
        (acc, item) => {
          acc.brokerage +=
            Number(
              item.brokerageTarget
            );

          acc.revenue +=
            Number(
              item.revenueTarget
            );

          acc.achieved +=
            Number(
              item.achievedAmount
            );

          return acc;
        },
        {
          brokerage: 0,
          revenue: 0,
          achieved: 0,
        }
      );
    }, [targets]);

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <Target size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employee Targets
            </h1>

            <p className="text-sm text-slate-500">
              Manage monthly sales and
              revenue targets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/targets/create"
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={18} />
          Assign Target
        </button>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Employees Targeted"
          value={total}
          icon={
            <Users size={20} />
          }
        />

        <StatCard
          title="Brokerage Target"
          value={`₹${summary.brokerage.toLocaleString(
            "en-IN"
          )}`}
          icon={
            <WalletCards
              size={20}
            />
          }
        />

        <StatCard
          title="Revenue Target"
          value={`₹${summary.revenue.toLocaleString(
            "en-IN"
          )}`}
          icon={
            <Target size={20} />
          }
        />

        <StatCard
          title="Revenue Achieved"
          value={`₹${summary.achieved.toLocaleString(
            "en-IN"
          )}`}
          icon={
            <TrendingUp
              size={20}
            />
          }
        />
      </div>

      <TargetFilters
        search={search}
        month={month}
        year={year}
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
      />

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading targets...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !error && (
          <TargetTable
            targets={targets}
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
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
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
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
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
  value: string | number;
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