import {
  useEffect,
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

import { getAttendanceById } from "../../services/attendance.service";

import AttendanceStatusBadge from "../../features/attendance/AttendanceStatusBadge";

type AttendanceDetails = {
  id: string;

  attendanceDate: string;

  checkIn?: string | null;
  checkOut?: string | null;

  workingHours?: number | string | null;

  status: string;

  remarks?: string | null;

  employee: {
    id: string;
    employeeCode: string;
    name: string;
    email?: string | null;
    mobile?: string | null;

    role?: {
      name: string;
    };

    branch?: {
      name: string;
    };
  };
};

export default function AttendanceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attendance, setAttendance] =
    useState<AttendanceDetails | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response =
          await getAttendanceById(id);

        setAttendance(
          response.attendance
        );
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load attendance"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          Attendance Error
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Attendance not found
      </div>
    );
  }

  const initials =
    attendance.employee.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/attendance")
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Attendance Details
            </h1>

            <p className="text-sm text-slate-500">
              {formatDate(
                attendance.attendanceDate
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/attendance/${attendance.id}/edit`
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Pencil size={17} />
          Edit Attendance
        </button>
      </div>

      {/* Employee Profile */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xl font-bold text-white">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {attendance.employee.name}
              </h2>

              <AttendanceStatusBadge
                status={
                  attendance.status
                }
              />
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {
                attendance.employee
                  .employeeCode
              }
            </p>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Phone size={15} />

                {attendance.employee
                  .mobile || "-"}
              </div>

              <div className="flex items-center gap-2">
                <Mail size={15} />

                {attendance.employee
                  .email || "-"}
              </div>

              <div className="flex items-center gap-2">
                <UserRound size={15} />

                {attendance.employee
                  .role?.name || "-"}
              </div>

              <div className="flex items-center gap-2">
                <Building2
                  size={15}
                />

                {attendance.employee
                  .branch?.name || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Info */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={
            <CalendarDays size={20} />
          }
          label="Attendance Date"
          value={formatDate(
            attendance.attendanceDate
          )}
        />

        <InfoCard
          icon={<Clock3 size={20} />}
          label="Check In"
          value={formatTime(
            attendance.checkIn
          )}
        />

        <InfoCard
          icon={<Clock3 size={20} />}
          label="Check Out"
          value={formatTime(
            attendance.checkOut
          )}
        />

        <InfoCard
          icon={<Clock3 size={20} />}
          label="Working Hours"
          value={
            attendance.workingHours != null
              ? `${attendance.workingHours} hrs`
              : "-"
          }
        />
      </div>

      {/* Detail Section */}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Attendance Information
          </h3>

          <div className="mt-5 space-y-5">
            <DetailRow
              label="Status"
              value={
                attendance.status.replace(
                  "_",
                  " "
                )
              }
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
              value={
                attendance.workingHours !=
                null
                  ? `${attendance.workingHours} hours`
                  : "-"
              }
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Remarks
          </h3>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {attendance.remarks ||
              "No remarks added."}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          {icon}
        </div>

        <div>
          <p className="text-xs text-slate-500">
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

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(
  value?: string | null
) {
  if (!value) return "-";

  return new Date(
    value
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(
  value?: string | null
) {
  if (!value) return "-";

  return new Date(
    value
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}