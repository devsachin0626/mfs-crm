import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  Mail,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";

import {
  getAttendanceById,
} from "../../services/attendance.service";

import AttendanceStatusBadge from "../../features/attendance/AttendanceStatusBadge";

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  Attendance,
} from "../../types/attendance.types";

/* ============================
   PAGE
============================ */

export default function AttendanceDetailsPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const [
    attendance,
    setAttendance,
  ] =
    useState<Attendance | null>(
      null
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
     ROLE
  ============================ */

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
    }, [employee]);

  const canEdit =
    roleName ===
      "ADMIN" ||
    roleName ===
      "HR";

  /* ============================
     LOAD
  ============================ */

  useEffect(() => {
    let active =
      true;

    const loadAttendance =
      async () => {
        if (!id) {
          setError(
            "Attendance ID is missing"
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
            await getAttendanceById(
              id
            );

          if (!active) {
            return;
          }

          setAttendance(
            response.attendance
          );
        } catch (
          error: any
        ) {
          if (!active) {
            return;
          }

          setAttendance(
            null
          );

          setError(
            error?.response
              ?.data
              ?.message ||
              error?.message ||
              "Failed to load attendance"
          );
        } finally {
          if (active) {
            setLoading(
              false
            );
          }
        }
      };

    void loadAttendance();

    return () => {
      active =
        false;
    };
  }, [id]);

  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  /* ============================
     ERROR
  ============================ */

  if (error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/attendance"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft
            size={17}
          />

          Back to Attendance
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Attendance Error
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* ============================
     NOT FOUND
  ============================ */

  if (!attendance) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Attendance not found
      </div>
    );
  }

  /* ============================
     EMPLOYEE
  ============================ */

  const attendanceEmployee =
    attendance.employee;

  const employeeName =
    attendanceEmployee
      ?.name ||
    "Employee";

  const initials =
    employeeName
      .split(" ")
      .filter(Boolean)
      .map(
        (word) =>
          word[0]
      )
      .join("")
      .slice(
        0,
        2
      )
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/attendance"
              )
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Attendance Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {formatDate(
                attendance.attendanceDate
              )}
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() =>
              navigate(
                `/attendance/${attendance.id}/edit`
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <Pencil
              size={17}
            />

            Edit Attendance
          </button>
        )}
      </div>

      {/* ============================
          EMPLOYEE PROFILE
      ============================ */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xl font-bold text-white">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {employeeName}
              </h2>

              <AttendanceStatusBadge
                status={
                  attendance.status
                }
              />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {attendanceEmployee
                ?.employeeCode ||
                "-"}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Phone
                  size={15}
                />

                {attendanceEmployee
                  ?.mobile ||
                  "-"}
              </div>

              <div className="flex items-center gap-2">
                <Mail
                  size={15}
                />

                {attendanceEmployee
                  ?.email ||
                  "-"}
              </div>

              <div className="flex items-center gap-2">
                <UserRound
                  size={15}
                />

                {attendanceEmployee
                  ?.role
                  ?.name ||
                  "-"}
              </div>

              <div className="flex items-center gap-2">
                <Building2
                  size={15}
                />

                {attendanceEmployee
                  ?.branch
                  ?.name ||
                  "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================
          ATTENDANCE INFO
      ============================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={
            <CalendarDays
              size={20}
            />
          }
          label="Attendance Date"
          value={formatDate(
            attendance.attendanceDate
          )}
        />

        <InfoCard
          icon={
            <Clock3
              size={20}
            />
          }
          label="Check In"
          value={formatTime(
            attendance.checkIn
          )}
        />

        <InfoCard
          icon={
            <Clock3
              size={20}
            />
          }
          label="Check Out"
          value={formatTime(
            attendance.checkOut
          )}
        />

        <InfoCard
          icon={
            <Clock3
              size={20}
            />
          }
          label="Working Hours"
          value={formatWorkingHours(
            attendance.workingHours
          )}
        />
      </div>

      {/* ============================
          DETAIL SECTION
      ============================ */}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Attendance Information
          </h3>

          <div className="mt-5 space-y-5">
            <DetailRow
              label="Status"
              value={formatStatus(
                attendance.status
              )}
            />

            <DetailRow
              label="Check In"
              value={formatDateTime(
                attendance.checkIn
              )}
            />

            <DetailRow
              label="Check Out"
              value={formatDateTime(
                attendance.checkOut
              )}
            />

            <DetailRow
              label="Working Hours"
              value={formatWorkingHours(
                attendance.workingHours
              )}
            />

            {attendance.source && (
              <DetailRow
                label="Source"
                value={formatSource(
                  attendance.source
                )}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Remarks
          </h3>

          <div className="mt-5 min-h-28 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {attendance.remarks ||
              "No remarks added."}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================
   INFO CARD
============================ */

function InfoCard({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================
   DETAIL ROW
============================ */

function DetailRow({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-right text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* ============================
   DATE
============================ */

function formatDate(
  value: string
) {
  const datePart =
    value.slice(
      0,
      10
    );

  const [
    year,
    month,
    day,
  ] =
    datePart
      .split("-")
      .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

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

/* ============================
   TIME
============================ */

function formatTime(
  value?:
    | string
    | null
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

/* ============================
   DATE TIME
============================ */

function formatDateTime(
  value?:
    | string
    | null
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );
}

/* ============================
   WORKING HOURS
============================ */

function formatWorkingHours(
  value?:
    | number
    | string
    | null
) {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      ""
  ) {
    return "-";
  }

  const parsed =
    Number(value);

  if (
    Number.isNaN(
      parsed
    )
  ) {
    return "-";
  }

  return `${parsed.toFixed(
    2
  )} hrs`;
}

/* ============================
   STATUS
============================ */

function formatStatus(
  value:
    | string
    | null
) {
  if (!value) {
    return "Upcoming";
  }

  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

/* ============================
   SOURCE
============================ */

function formatSource(
  value: string
) {
  switch (value) {
    case "ATTENDANCE":
      return "Employee Attendance";

    case "HOLIDAY":
      return "Company Holiday";

    case "WEEK_OFF":
      return "Weekly Off";

    case "LEAVE":
      return "Approved Leave";

    case "SYSTEM":
      return "System Generated";

    case "FUTURE":
      return "Upcoming";

    default:
      return value;
  }
}