import type {
  Attendance,
  AttendanceStatus,
} from "../../types/attendance.types";

/* ============================
   PROPS
============================ */

type Props = {
  month: number;

  year: number;

  attendances:
    Attendance[];

  cycleStart?: string;

  cycleEnd?: string;
};

/* ============================
   STATUS CONFIG
============================ */

const statusLabel:
  Record<
    AttendanceStatus,
    string
  > = {
  PRESENT: "P",

  LATE: "L",

  HALF_DAY: "HD",

  ABSENT: "A",

  LEAVE: "LV",

  HOLIDAY: "H",
};

const statusText:
  Record<
    AttendanceStatus,
    string
  > = {
  PRESENT: "Present",

  LATE: "Late",

  HALF_DAY: "Half Day",

  ABSENT: "Absent",

  LEAVE: "Leave",

  HOLIDAY: "Holiday",
};

const statusClass:
  Record<
    AttendanceStatus,
    string
  > = {
  PRESENT:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

  LATE:
    "bg-amber-50 text-amber-700 ring-amber-600/10",

  HALF_DAY:
    "bg-orange-50 text-orange-700 ring-orange-600/10",

  ABSENT:
    "bg-red-50 text-red-700 ring-red-600/10",

  LEAVE:
    "bg-violet-50 text-violet-700 ring-violet-600/10",

  HOLIDAY:
    "bg-slate-100 text-slate-600 ring-slate-500/10",
};

/* ============================
   DATE HELPERS
============================ */

const startOfDay = (
  value: Date
) => {
  const date =
    new Date(value);

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
};

const addDays = (
  value: Date,
  days: number
) => {
  const date =
    new Date(value);

  date.setDate(
    date.getDate() +
      days
  );

  return date;
};

const dateKey = (
  value: Date
) => {
  return [
    value.getFullYear(),

    String(
      value.getMonth() +
        1
    ).padStart(
      2,
      "0"
    ),

    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    ),
  ].join("-");
};

/* ============================
   PARSE API DATE

   Avoid timezone shifting for
   YYYY-MM-DD values.
============================ */

const parseDate = (
  value: string
) => {
  const datePart =
    value.slice(
      0,
      10
    );

  const parts =
    datePart.split("-");

  if (
    parts.length ===
    3
  ) {
    const year =
      Number(
        parts[0]
      );

    const month =
      Number(
        parts[1]
      );

    const day =
      Number(
        parts[2]
      );

    if (
      Number.isInteger(
        year
      ) &&
      Number.isInteger(
        month
      ) &&
      Number.isInteger(
        day
      )
    ) {
      return new Date(
        year,
        month - 1,
        day
      );
    }
  }

  return new Date(
    value
  );
};

/* ============================
   PAYROLL CYCLE

   Example:
   month = 8
   year = 2026

   26 Jul 2026
      →
   25 Aug 2026
============================ */

const getPayrollCycle = (
  month: number,
  year: number
) => {
  const start =
    new Date(
      year,
      month - 2,
      26
    );

  start.setHours(
    0,
    0,
    0,
    0
  );

  const end =
    new Date(
      year,
      month - 1,
      25
    );

  end.setHours(
    0,
    0,
    0,
    0
  );

  return {
    start,
    end,
  };
};

/* ============================
   FORMAT DATE
============================ */

const formatDate = (
  value: Date
) => {
  return value.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
};

/* ============================
   FORMAT TIME
============================ */

const formatTime = (
  value?: string | null
) => {
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
      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );
};

/* ============================
   CALENDAR
============================ */

export default function AttendanceCalendar({
  month,
  year,
  attendances,
  cycleStart,
  cycleEnd,
}: Props) {
  /* ============================
     CYCLE
  ============================ */

  const fallbackCycle =
    getPayrollCycle(
      month,
      year
    );

  const startDate =
    cycleStart
      ? startOfDay(
          parseDate(
            cycleStart
          )
        )
      : fallbackCycle.start;

  const endDate =
    cycleEnd
      ? startOfDay(
          parseDate(
            cycleEnd
          )
        )
      : fallbackCycle.end;

  /* ============================
     ATTENDANCE MAP

     IMPORTANT:
     Use full YYYY-MM-DD key.

     Old code used only day
     number, which cannot work
     for a 2-month cycle.
  ============================ */

  const attendanceMap =
    new Map<
      string,
      Attendance
    >();

  attendances.forEach(
    (item) => {
      const date =
        parseDate(
          item.attendanceDate
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      attendanceMap.set(
        dateKey(
          date
        ),
        item
      );
    }
  );

  /* ============================
     BUILD ALL CYCLE DATES
  ============================ */

  const cycleDates:
    Date[] = [];

  let cursor =
    new Date(
      startDate
    );

  while (
    cursor <=
    endDate
  ) {
    cycleDates.push(
      new Date(
        cursor
      )
    );

    cursor =
      addDays(
        cursor,
        1
      );
  }

  /* ============================
     CALENDAR CELLS

     Start from actual weekday
     of 26th.
  ============================ */

  const cells:
    (
      | Date
      | null
    )[] = [];

  const startDay =
    startDate.getDay();

  for (
    let index = 0;
    index <
    startDay;
    index++
  ) {
    cells.push(
      null
    );
  }

  cycleDates.forEach(
    (date) => {
      cells.push(
        date
      );
    }
  );

  /*
   * Complete final calendar row
   * for cleaner UI.
   */

  while (
    cells.length %
      7 !==
    0
  ) {
    cells.push(
      null
    );
  }

  /* ============================
     TODAY
  ============================ */

  const today =
    startOfDay(
      new Date()
    );

  /* ============================
     RENDER
  ============================ */

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ============================
          HEADER
      ============================ */}

      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Attendance
              Calendar
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payroll cycle
              attendance
              overview
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
              Attendance
              Cycle
            </p>

            <p className="mt-0.5 text-sm font-semibold text-blue-800">
              {formatDate(
                startDate
              )}{" "}
              —{" "}
              {formatDate(
                endDate
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ============================
          LEGEND
      ============================ */}

      <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
        {(
          Object.keys(
            statusLabel
          ) as AttendanceStatus[]
        ).map(
          (status) => (
            <div
              key={
                status
              }
              className="flex items-center gap-1.5"
            >
              <span
                className={`inline-flex min-w-7 items-center justify-center rounded-md px-1.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusClass[status]}`}
              >
                {
                  statusLabel[
                    status
                  ]
                }
              </span>

              <span className="text-xs text-slate-500">
                {
                  statusText[
                    status
                  ]
                }
              </span>
            </div>
          )
        )}

        <div className="flex items-center gap-1.5">
          <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-white px-1.5 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-inset ring-slate-200">
            —
          </span>

          <span className="text-xs text-slate-500">
            Future
          </span>
        </div>
      </div>

      {/* ============================
          CALENDAR
      ============================ */}

      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="min-w-205">
          {/* WEEK DAYS */}

          <div className="grid grid-cols-7 gap-2 text-center">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map(
              (day) => (
                <div
                  key={
                    day
                  }
                  className="py-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
                >
                  {day}
                </div>
              )
            )}
          </div>

          {/* DATE CELLS */}

          <div className="grid grid-cols-7 gap-2">
            {cells.map(
              (
                date,
                index
              ) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-32 rounded-xl bg-slate-50/40"
                    />
                  );
                }

                const key =
                  dateKey(
                    date
                  );

                const attendance =
                  attendanceMap.get(
                    key
                  );

                const status =
                  attendance
                    ?.status ??
                  null;

                const isToday =
                  dateKey(
                    date
                  ) ===
                  dateKey(
                    today
                  );

                const isFuture =
                  date >
                  today ||
                  attendance
                    ?.source ===
                    "FUTURE";

                const isPreviousMonth =
                  date.getMonth() !==
                  month - 1;

                const isSunday =
                  date.getDay() ===
                  0;

                return (
                  <div
                    key={
                      key
                    }
                    className={`relative min-h-32 rounded-xl border p-3 transition ${
                      isToday
                        ? "border-blue-400 bg-blue-50/40 ring-1 ring-blue-200"
                        : isSunday
                          ? "border-slate-200 bg-slate-50/70"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {/* DATE */}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-semibold ${
                              isToday
                                ? "text-blue-700"
                                : isPreviousMonth
                                  ? "text-slate-500"
                                  : "text-slate-900"
                            }`}
                          >
                            {
                              date.getDate()
                            }
                          </span>

                          {isToday && (
                            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                              Today
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          {date.toLocaleDateString(
                            "en-IN",
                            {
                              month:
                                "short",
                            }
                          )}
                        </p>
                      </div>

                      {/* STATUS */}

                      {status ? (
                        <span
                          title={
                            statusText[
                              status
                            ]
                          }
                          className={`inline-flex min-w-8 items-center justify-center rounded-lg px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${statusClass[status]}`}
                        >
                          {
                            statusLabel[
                              status
                            ]
                          }
                        </span>
                      ) : isFuture ? (
                        <span className="rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-400 ring-1 ring-inset ring-slate-200">
                          —
                        </span>
                      ) : null}
                    </div>

                    {/* DETAILS */}

                    {attendance &&
                      !isFuture && (
                        <div className="mt-3 space-y-1.5 text-[11px]">
                          {attendance.checkIn && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">
                                In
                              </span>

                              <span className="font-medium text-slate-600">
                                {formatTime(
                                  attendance.checkIn
                                )}
                              </span>
                            </div>
                          )}

                          {attendance.checkOut && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">
                                Out
                              </span>

                              <span className="font-medium text-slate-600">
                                {formatTime(
                                  attendance.checkOut
                                )}
                              </span>
                            </div>
                          )}

                          {attendance.workingHours !=
                            null && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">
                                Hours
                              </span>

                              <span className="font-semibold text-slate-700">
                                {Number(
                                  attendance.workingHours
                                ).toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          )}

                          {!attendance.checkIn &&
                            attendance.remarks && (
                              <p
                                title={
                                  attendance.remarks
                                }
                                className="mt-2 line-clamp-2 leading-4 text-slate-500"
                              >
                                {
                                  attendance.remarks
                                }
                              </p>
                            )}
                        </div>
                      )}

                    {/* FUTURE */}

                    {isFuture && (
                      <p className="mt-4 text-[11px] text-slate-400">
                        Upcoming
                      </p>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}