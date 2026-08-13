import { useEffect } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchDashboard } from "../../store/slices/dashboardSlice";

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const { data, loading, error } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const stats = data?.stats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome to MFS CRM
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />

            <p className="mt-3 text-sm text-gray-500">
              Loading dashboard...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-700">
              Dashboard Error
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => dispatch(fetchDashboard())}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Employees */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Total Employees
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-700">
                {stats.totalEmployees ?? 0}
              </p>
            </div>

            {/* Total Leads */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Total Leads
              </p>

              <p className="mt-2 text-3xl font-bold text-indigo-700">
                {stats.totalLeads ?? 0}
              </p>
            </div>

            {/* Total Follow Ups */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Total Follow-Ups
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-700">
                {stats.totalFollowUps ?? 0}
              </p>
            </div>

            {/* Pending Follow Ups */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Pending Follow-Ups
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-600">
                {stats.pendingFollowUps ?? 0}
              </p>
            </div>

            {/* Today's Follow Ups */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Today's Follow-Ups
              </p>

              <p className="mt-2 text-3xl font-bold text-cyan-700">
                {stats.todayFollowUps ?? 0}
              </p>
            </div>

            {/* Converted Leads */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Converted Leads
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {stats.convertedLeads ?? 0}
              </p>
            </div>

            {/* Lost Leads */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Lost Leads
              </p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {stats.lostLeads ?? 0}
              </p>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Conversion Rate
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {stats.totalLeads
                  ? `${(
                      (stats.convertedLeads /
                        stats.totalLeads) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}