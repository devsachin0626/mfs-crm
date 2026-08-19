import {
  useEffect,
  useMemo,
  useState,
} from "react";



import {
  CalendarCheck,
  Clock3,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  LogIn,
  LogOut,
} from "lucide-react";

import {
  checkIn,
  checkOut,
} from "../../services/attendance.service";

import { fetchAttendances } from "../../store/slices/attendanceSlice";

import AttendanceFilters from "../../features/attendance/AttendanceFilters";
import AttendanceTable from "../../features/attendance/AttendanceTable";

export default function AttendanceListPage() {

    const employee = useAppSelector(
  (state) => state.auth.employee
);

const [attendanceAction, setAttendanceAction] =
  useState<"CHECK_IN" | "CHECK_OUT" | null>(null);

const [actionMessage, setActionMessage] =
  useState("");

const [actionError, setActionError] =
  useState("");


  const dispatch = useAppDispatch();

  const now = new Date();

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
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
    attendances,
    loading,
    error,
    total,
    totalPages,
  } = useAppSelector(
    (state) => state.attendance
  );

  useEffect(() => {
    dispatch(
      fetchAttendances({
        page,
        limit: 10,
        search:
          search || undefined,
        status:
          status || undefined,
        month,
        year,
      })
    );
  }, [
    dispatch,
    page,
    search,
    status,
    month,
    year,
  ]);

  const pageStats =
    useMemo(() => {
      return {
        present:
          attendances.filter(
            (item) =>
              item.status ===
              "PRESENT"
          ).length,

        late:
          attendances.filter(
            (item) =>
              item.status ===
              "LATE"
          ).length,

        halfDay:
          attendances.filter(
            (item) =>
              item.status ===
              "HALF_DAY"
          ).length,
      };
    }, [attendances]);

    const handleCheckIn = async () => {
  if (!employee?.id) {
    setActionError(
      "Logged in employee not found"
    );
    return;
  }

  try {
    setAttendanceAction("CHECK_IN");
    setActionError("");
    setActionMessage("");

    const response = await checkIn({
      employeeId: employee.id,
    });

    setActionMessage(
      response.message ||
        "Check In Successful"
    );

    dispatch(
      fetchAttendances({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        month,
        year,
      })
    );
  } catch (error: any) {
    setActionError(
      error?.response?.data?.message ||
        "Check In Failed"
    );
  } finally {
    setAttendanceAction(null);
  }
};

const handleCheckOut = async () => {
  if (!employee?.id) {
    setActionError(
      "Logged in employee not found"
    );
    return;
  }

  try {
    setAttendanceAction("CHECK_OUT");
    setActionError("");
    setActionMessage("");

    const response = await checkOut({
      employeeId: employee.id,
    });

    setActionMessage(
      response.message ||
        "Check Out Successful"
    );

    dispatch(
      fetchAttendances({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        month,
        year,
      })
    );
  } catch (error: any) {
    setActionError(
      error?.response?.data?.message ||
        "Check Out Failed"
    );
  } finally {
    setAttendanceAction(null);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
      <CalendarCheck size={24} />
    </div>

    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Attendance
      </h1>

      <p className="text-sm text-slate-500">
        Track employee attendance and working hours
      </p>
    </div>
  </div>

  <div className="flex gap-3">
    <button
      type="button"
      onClick={handleCheckIn}
      disabled={attendanceAction !== null}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      <LogIn size={17} />

      {attendanceAction === "CHECK_IN"
        ? "Checking In..."
        : "Check In"}
    </button>

    <button
      type="button"
      onClick={handleCheckOut}
      disabled={attendanceAction !== null}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
    >
      <LogOut size={17} />

      {attendanceAction === "CHECK_OUT"
        ? "Checking Out..."
        : "Check Out"}
    </button>
  </div>
</div>

{actionMessage && (
  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
    {actionMessage}
  </div>
)}

{actionError && (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    {actionError}
  </div>
)}

      {/* Cards */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Records"
          value={total}
          icon={
            <CalendarCheck
              size={20}
            />
          }
        />

        <StatCard
          title="Present"
          value={
            pageStats.present
          }
          icon={
            <UserCheck
              size={20}
            />
          }
        />

        <StatCard
          title="Late"
          value={pageStats.late}
          icon={
            <Clock3 size={20} />
          }
        />

        <StatCard
          title="Half Day"
          value={
            pageStats.halfDay
          }
          icon={
            <UserX size={20} />
          }
        />
      </div>

      <AttendanceFilters
        search={search}
        status={status}
        month={month}
        year={year}
        onSearchChange={(
          value
        ) => {
          setPage(1);
          setSearch(value);
        }}
        onStatusChange={(
          value
        ) => {
          setPage(1);
          setStatus(value);
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
            Loading attendance...
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
          <AttendanceTable
            attendances={
              attendances
            }
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