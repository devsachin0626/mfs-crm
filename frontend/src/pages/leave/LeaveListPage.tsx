import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Plus,
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

export default function LeaveListPage() {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const {
    leaves,
    loading,
    error,
    total,
    totalPages,
  } = useAppSelector(
    (state) => state.leave
  );

  useEffect(() => {
    dispatch(
      fetchLeaves({
        page,
        limit: 10,
        search:
          search || undefined,
        status:
          status || undefined,
      })
    );
  }, [
    dispatch,
    page,
    search,
    status,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}

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

            <p className="text-sm text-slate-500">
              Manage employee leave requests
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/leaves/create"
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Plus size={18} />
          Apply Leave
        </button>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Requests
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Current Page
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {page}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Showing
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {leaves.length}
          </p>
        </div>
      </div>

      <LeaveFilters
        search={search}
        status={status}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onStatusChange={(value) => {
          setPage(1);
          setStatus(value);
        }}
      />

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading leaves...
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
          <LeaveTable
            leaves={leaves}
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
                disabled={page <= 1}
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
                  page >= totalPages
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