import type {
  AttendanceStatus,
} from "../../types/attendance.types";

/* ============================
   PROPS
============================ */

type Props = {
  status:
    | AttendanceStatus
    | null
    | undefined;
};

/* ============================
   STATUS CONFIG
============================ */

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    className: string;
  }
> = {
  PRESENT: {
    label: "Present",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },

  LATE: {
    label: "Late",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/10",
  },

  HALF_DAY: {
    label: "Half Day",
    className:
      "bg-orange-50 text-orange-700 ring-orange-600/10",
  },

  ABSENT: {
    label: "Absent",
    className:
      "bg-red-50 text-red-700 ring-red-600/10",
  },

  LEAVE: {
    label: "Leave",
    className:
      "bg-blue-50 text-blue-700 ring-blue-600/10",
  },

  HOLIDAY: {
    label: "Holiday",
    className:
      "bg-purple-50 text-purple-700 ring-purple-600/10",
  },
};

/* ============================
   COMPONENT
============================ */

export default function AttendanceStatusBadge({
  status,
}: Props) {
  /* ============================
     FUTURE / NO STATUS
  ============================ */

  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-500/10">
        Upcoming
      </span>
    );
  }

  const config =
    STATUS_CONFIG[
      status
    ];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}