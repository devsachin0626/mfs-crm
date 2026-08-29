import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchLeaves,
} from "../../store/slices/leaveSlice";

import LeaveFilters from "../../features/leave/LeaveFilters";
import LeaveTable from "../../features/leave/LeaveTable";

/* ============================
   PAGE
============================ */

export default function LeaveListPage() {
  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

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

  const isEmployee =
    roleName ===
    "EMPLOYEE";

  const canSearchEmployees =
    roleName ===
      "ADMIN" ||
    roleName ===
      "HR" ||
    roleName ===
      "TEAM_LEADER";

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
    status,
    setStatus,
  ] =
    useState("");

  /* ============================
     REDUX
  ============================ */

  const {
    leaves,
    loading,
    error,
    total,
    totalPages,
  } =
    useAppSelector(
      (state) =>
        state.leave
    );

  /* ============================
     LOAD LEAVES
  ============================ */

  useEffect(() => {
    dispatch(
      fetchLeaves({
        page,

        limit: 10,

        search:
          canSearchEmployees &&
          search.trim()
            ? search.trim()
            : undefined,

        status:
          status ||
          undefined,
      })
    );
  }, [
    dispatch,
    page,
    search,
    status,
    canSearchEmployees,
  ]);

  /* ============================
     CURRENT PAGE SUMMARY
  ============================ */

  const summary =
    useMemo(() => {
      const pending =
        leaves.filter(
          (item) =>
            item.status ===
            "PENDING"
        ).length;

      const approved =
        leaves.filter(
          (item) =>
            item.status ===
            "APPROVED"
        ).length;

      const rejected =
        leaves.filter(
          (item) =>
            item.status ===
            "REJECTED"
        ).length;

      return {
        pending,
        approved,
        rejected,
      };
    }, [
      leaves,
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
            <CalendarDays
              size={24}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Leave Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {isEmployee
                ? "View and manage your leave requests"
                : "Manage employee leave requests"}
            </p>
          </div>
        </div>

        {/* ============================
            APPLY LEAVE
        ============================ */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/leaves/create"
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          <Plus
            size={18}
          />

          Apply Leave
        </button>
      </div>

      {/* ============================
          INFO
      ============================ */}

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm font-semibold text-blue-800">
          Leave & Payroll
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700">
          Only approved leave is
          considered by attendance
          and payroll. Payroll
          calculates applicable
          working leave days
          separately from calendar
          days.
        </p>
      </div>

      {/* ============================
          SUMMARY
      ============================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requests"
          value={
            total
          }
          icon={
            <CalendarDays
              size={19}
            />
          }
        />

        <StatCard
          title="Pending"
          value={
            summary.pending
          }
          icon={
            <Clock3
              size={19}
            />
          }
        />

        <StatCard
          title="Approved"
          value={
            summary.approved
          }
          icon={
            <CheckCircle2
              size={19}
            />
          }
        />

        <StatCard
          title="Rejected"
          value={
            summary.rejected
          }
          icon={
            <XCircle
              size={19}
            />
          }
        />
      </div>

      {/* ============================
          FILTERS
      ============================ */}

      <LeaveFilters
        search={
          search
        }
        status={
          status
        }
        showEmployeeSearch={
          canSearchEmployees
        }
        onSearchChange={(
          value
        ) => {
          setPage(
            1
          );

          setSearch(
            value
          );
        }}
        onStatusChange={(
          value
        ) => {
          setPage(
            1
          );

          setStatus(
            value
          );
        }}
      />

      {/* ============================
          RESULT INFO
      ============================ */}

      {!loading &&
        !error && (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Total Leave Requests:{" "}
              <span className="font-semibold text-slate-700">
                {
                  total
                }
              </span>
            </p>

            <p className="text-xs text-slate-400">
              Showing{" "}
              {
                leaves.length
              }{" "}
              records on this page
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
            Loading leaves...
          </p>
        </div>
      )}

      {/* ============================
          ERROR
      ============================ */}

      {!loading &&
        error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

      {/* ============================
          TABLE
      ============================ */}

      {!loading &&
        !error && (
          <LeaveTable
            leaves={
              leaves
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

          <p className="mt-2 text-3xl font-bold text-slate-900">
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