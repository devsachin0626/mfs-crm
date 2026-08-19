import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Download,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import { fetchEmployees } from "../../store/slices/employeeSlice";

import EmployeeTable from "../../features/employee/EmployeeTable";
import EmployeeFilters from "../../features/employee/EmployeeFilters";

export default function EmployeeListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const {
    employees,
    loading,
    error,
    total,
    totalPages,
  } = useAppSelector(
    (state) => state.employee
  );

  useEffect(() => {
    dispatch(
      fetchEmployees({
        page,
        limit: 10,
        search,
        status,
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
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <Users
                size={24}
                className="text-blue-700"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Employees
              </h1>

              <p className="text-sm text-slate-500">
                Manage company employees,
                roles and branches
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download size={17} />
            Export
          </button>

          <button
            onClick={() =>
              navigate(
                "/employees/create"
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
          >
            <Plus size={18} />
            New Employee
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Total Employees
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Showing
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {employees.length}
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
      </div>

      <EmployeeFilters
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading employees...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <EmployeeTable
          employees={employees}
        />
      )}

      {/* Pagination */}
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
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
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
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
    </div>
  );
}