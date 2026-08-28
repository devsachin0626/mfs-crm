import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarCheck,
  Clock3,
  LogIn,
  LogOut,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  checkIn,
  checkOut,
  getMonthlyAttendanceReport,
} from "../../services/attendance.service";

import {
  fetchAttendances,
} from "../../store/slices/attendanceSlice";

import AttendanceFilters from "../../features/attendance/AttendanceFilters";

import AttendanceTable from "../../features/attendance/AttendanceTable";

import AttendanceMonthlySummary from "../../features/attendance/AttendanceMonthlySummary";

import AttendanceCalendar from "../../features/attendance/AttendanceCalendar";

import type {
  AttendanceQuery,
  MonthlyAttendanceReport,
} from "../../types/attendance.types";

/* ============================
   CURRENT PAYROLL MONTH

   Cycle:
   26 previous month
        →
   25 selected month

   Example:

   28 Aug 2026
   active cycle =
   26 Aug → 25 Sep

   therefore:

   month = 9
   year = 2026
============================ */

const getCurrentPayrollMonth =
  () => {
    const today =
      new Date();

    let month =
      today.getMonth() + 1;

    let year =
      today.getFullYear();

    if (
      today.getDate() >=
      26
    ) {
      month++;

      if (
        month > 12
      ) {
        month = 1;

        year++;
      }
    }

    return {
      month,
      year,
    };
  };

/* ============================
   PAGE
============================ */

export default function AttendanceListPage() {
  const dispatch =
    useAppDispatch();

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

  const canViewEmployeeSearch =
    roleName ===
      "ADMIN" ||
    roleName ===
      "HR" ||
    roleName ===
      "TEAM_LEADER";

  /* ============================
     CURRENT CYCLE
  ============================ */

  const initialCycle =
    useMemo(
      () =>
        getCurrentPayrollMonth(),
      []
    );

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

  const [
    month,
    setMonth,
  ] =
    useState(
      initialCycle.month
    );

  const [
    year,
    setYear,
  ] =
    useState(
      initialCycle.year
    );

  /* ============================
     MONTHLY REPORT
  ============================ */

  const [
    monthlyReport,
    setMonthlyReport,
  ] =
    useState<MonthlyAttendanceReport | null>(
      null
    );

  const [
    reportLoading,
    setReportLoading,
  ] =
    useState(false);

  const [
    reportError,
    setReportError,
  ] =
    useState("");

  /* ============================
     CHECK-IN / OUT
  ============================ */

  const [
    attendanceAction,
    setAttendanceAction,
  ] =
    useState<
      | "CHECK_IN"
      | "CHECK_OUT"
      | null
    >(null);

  const [
    actionMessage,
    setActionMessage,
  ] =
    useState("");

  const [
    actionError,
    setActionError,
  ] =
    useState("");

  /* ============================
     REDUX ATTENDANCE
  ============================ */

  const {
    attendances,
    loading,
    error,
    total,
    totalPages,
  } =
    useAppSelector(
      (state) =>
        state.attendance
    );

  /* ============================
     LIST QUERY
  ============================ */

  const attendanceQuery =
    useMemo<
      AttendanceQuery
    >(
      () => ({
        page,

        limit: 20,

        search:
          canViewEmployeeSearch &&
          search.trim()
            ? search.trim()
            : undefined,

        status:
          status
            ? status as AttendanceQuery["status"]
            : undefined,

        month,

        year,

        employeeId:
          isEmployee
            ? employee?.id
            : undefined,
      }),
      [
        page,
        search,
        status,
        month,
        year,
        canViewEmployeeSearch,
        isEmployee,
        employee?.id,
      ]
    );

  /* ============================
     LOAD ATTENDANCE LIST
  ============================ */

  const loadAttendanceList =
    useCallback(
      async () => {
        await dispatch(
          fetchAttendances(
            attendanceQuery
          )
        );
      },
      [
        dispatch,
        attendanceQuery,
      ]
    );

  useEffect(() => {
    void loadAttendanceList();
  }, [
    loadAttendanceList,
  ]);

  /* ============================
     LOAD MY MONTHLY REPORT

     Calendar currently shows
     logged-in employee's report.

     Admin/HR/TL can see other
     employees from employee
     profile Attendance tab.
  ============================ */

  const loadMonthlyReport =
    useCallback(
      async () => {
        if (
          !employee?.id
        ) {
          setMonthlyReport(
            null
          );

          return;
        }

        try {
          setReportLoading(
            true
          );

          setReportError(
            ""
          );

          const response =
            await getMonthlyAttendanceReport(
              employee.id,
              month,
              year
            );

          setMonthlyReport(
            response
          );
        } catch (
          error: any
        ) {
          setMonthlyReport(
            null
          );

          setReportError(
            error?.response
              ?.data
              ?.message ||
              error?.message ||
              "Failed to load attendance summary"
          );
        } finally {
          setReportLoading(
            false
          );
        }
      },
      [
        employee?.id,
        month,
        year,
      ]
    );

  useEffect(() => {
    void loadMonthlyReport();
  }, [
    loadMonthlyReport,
  ]);

  /* ============================
     REFRESH ALL
  ============================ */

  const refreshAttendance =
    useCallback(
      async () => {
        await Promise.all([
          loadAttendanceList(),

          loadMonthlyReport(),
        ]);
      },
      [
        loadAttendanceList,
        loadMonthlyReport,
      ]
    );

  /* ============================
     PAGE STATS

     These represent currently
     loaded attendance records.
  ============================ */

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
    }, [
      attendances,
    ]);

  /* ============================
     CHECK IN
  ============================ */

  const handleCheckIn =
    async () => {
      if (
        attendanceAction
      ) {
        return;
      }

      try {
        setAttendanceAction(
          "CHECK_IN"
        );

        setActionError(
          ""
        );

        setActionMessage(
          ""
        );

        const response =
          await checkIn({
            remarks:
              "Self Check-In",
          });

        setActionMessage(
          response.message ||
            "Check In Successful"
        );

        await refreshAttendance();
      } catch (
        error: any
      ) {
        setActionError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Check In Failed"
        );
      } finally {
        setAttendanceAction(
          null
        );
      }
    };

  /* ============================
     CHECK OUT
  ============================ */

  const handleCheckOut =
    async () => {
      if (
        attendanceAction
      ) {
        return;
      }

      try {
        setAttendanceAction(
          "CHECK_OUT"
        );

        setActionError(
          ""
        );

        setActionMessage(
          ""
        );

        const response =
          await checkOut({
            remarks:
              "Self Check-Out",
          });

        setActionMessage(
          response.message ||
            "Check Out Successful"
        );

        await refreshAttendance();
      } catch (
        error: any
      ) {
        setActionError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Check Out Failed"
        );
      } finally {
        setAttendanceAction(
          null
        );
      }
    };

  /* ============================
     FILTER HANDLERS
  ============================ */

  const handleSearchChange =
    (
      value: string
    ) => {
      setPage(1);

      setSearch(
        value
      );
    };

  const handleStatusChange =
    (
      value: string
    ) => {
      setPage(1);

      setStatus(
        value
      );
    };

  const handleMonthChange =
    (
      value: number
    ) => {
      setPage(1);

      setMonth(
        value
      );
    };

  const handleYearChange =
    (
      value: number
    ) => {
      setPage(1);

      setYear(
        value
      );
    };

  return (
    <div className="space-y-6">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <CalendarCheck
              size={24}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {isEmployee
                ? "Track your attendance, working hours and payroll cycle."
                : "Track employee attendance, working hours and payroll cycles."}
            </p>

            <p className="mt-1 text-xs font-medium text-blue-600">
              Attendance cycle:
              26th → 25th
            </p>
          </div>
        </div>

        {/* ============================
            SELF CHECK IN / OUT
        ============================ */}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void handleCheckIn()
            }
            disabled={
              attendanceAction !==
              null
            }
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn
              size={17}
            />

            {attendanceAction ===
            "CHECK_IN"
              ? "Checking In..."
              : "Check In"}
          </button>

          <button
            type="button"
            onClick={() =>
              void handleCheckOut()
            }
            disabled={
              attendanceAction !==
              null
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut
              size={17}
            />

            {attendanceAction ===
            "CHECK_OUT"
              ? "Checking Out..."
              : "Check Out"}
          </button>
        </div>
      </div>

      {/* ============================
          ACTION SUCCESS
      ============================ */}

      {actionMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {
            actionMessage
          }
        </div>
      )}

      {/* ============================
          ACTION ERROR
      ============================ */}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {
            actionError
          }
        </div>
      )}

      {/* ============================
          LIST STATS
      ============================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Records"
          value={
            total
          }
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
          value={
            pageStats.late
          }
          icon={
            <Clock3
              size={20}
            />
          }
        />

        <StatCard
          title="Half Day"
          value={
            pageStats.halfDay
          }
          icon={
            <UserX
              size={20}
            />
          }
        />
      </div>

      {/* ============================
          FILTERS
      ============================ */}

      <AttendanceFilters
        search={
          search
        }
        status={
          status
        }
        month={
          month
        }
        year={
          year
        }
        showEmployeeSearch={
          canViewEmployeeSearch
        }
        onSearchChange={
          handleSearchChange
        }
        onStatusChange={
          handleStatusChange
        }
        onMonthChange={
          handleMonthChange
        }
        onYearChange={
          handleYearChange
        }
      />

      {/* ============================
          MY ATTENDANCE SUMMARY

          For ADMIN/HR/TL this
          still represents their
          own attendance.
      ============================ */}

      {canViewEmployeeSearch && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-700">
            My Attendance
            Summary
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Calendar and summary
            below belong to your
            logged-in employee
            account. Open an
            employee profile to
            view that employee's
            attendance report.
          </p>
        </div>
      )}

      {/* ============================
          REPORT ERROR
      ============================ */}

      {reportError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {
            reportError
          }
        </div>
      )}

      {/* ============================
          MONTHLY SUMMARY
      ============================ */}

      <AttendanceMonthlySummary
        report={
          monthlyReport
        }
        loading={
          reportLoading
        }
      />

      {/* ============================
          26 → 25 CALENDAR
      ============================ */}

      {!reportLoading &&
        monthlyReport && (
          <AttendanceCalendar
            month={
              month
            }
            year={
              year
            }
            cycleStart={
              monthlyReport.cycleStart
            }
            cycleEnd={
              monthlyReport.cycleEnd
            }
            attendances={
              monthlyReport.attendances
            }
          />
        )}

      {/* ============================
          LIST LOADING
      ============================ */}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading
            attendance...
          </p>
        </div>
      )}

      {/* ============================
          LIST ERROR
      ============================ */}

      {!loading &&
        error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

      {/* ============================
          ATTENDANCE TABLE
      ============================ */}

      {!loading &&
        !error && (
          <AttendanceTable
            attendances={
              attendances
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
          <p className="text-sm font-medium text-slate-500">
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