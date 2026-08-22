import type {
  Attendance,
} from "../../types/attendance.types";

type Props = {
  month: number;
  year: number;

  attendances:
    Attendance[];
};

const statusLabel: Record<
  Attendance["status"],
  string
> = {
  PRESENT: "P",
  LATE: "L",
  HALF_DAY: "HD",
  ABSENT: "A",
  LEAVE: "LV",
  HOLIDAY: "H",
};

export default function AttendanceCalendar({
  month,
  year,
  attendances,
}: Props) {
  const firstDay =
    new Date(
      year,
      month - 1,
      1
    );

  const daysInMonth =
    new Date(
      year,
      month,
      0
    ).getDate();

  const startDay =
    firstDay.getDay();

  const attendanceMap =
    new Map<
      number,
      Attendance
    >();

  attendances.forEach(
    (item) => {
      const date =
        new Date(
          item.attendanceDate
        );

      attendanceMap.set(
        date.getDate(),
        item
      );
    }
  );

  const cells:
    (
      | number
      | null
    )[] = [];

  for (
    let i = 0;
    i < startDay;
    i++
  ) {
    cells.push(
      null
    );
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push(
      day
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Attendance Calendar
        </h2>

        <p className="text-sm text-slate-500">
          Monthly attendance overview
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
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
              className="py-2"
            >
              {day}
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map(
          (
            day,
            index
          ) => {
            if (
              day ===
              null
            ) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-24"
                />
              );
            }

            const attendance =
              attendanceMap.get(
                day
              );

            return (
              <div
                key={
                  day
                }
                className="min-h-24 rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-start justify-between">
                  <span className="font-medium text-slate-900">
                    {day}
                  </span>

                  {attendance && (
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      {
                        statusLabel[
                          attendance
                            .status
                        ]
                      }
                    </span>
                  )}
                </div>

                {attendance && (
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {attendance.checkIn && (
                      <p>
                        In:{" "}
                        {new Date(
                          attendance.checkIn
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </p>
                    )}

                    {attendance.checkOut && (
                      <p>
                        Out:{" "}
                        {new Date(
                          attendance.checkOut
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </p>
                    )}

                    {attendance.workingHours !=
                      null && (
                      <p>
                        {
                          attendance.workingHours
                        }{" "}
                        hrs
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}