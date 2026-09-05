/* ============================
   PROPS
============================ */

type Props = {
  employeeId: string;

  employees: {
    id: string;
    employeeCode: string;
    name: string;
  }[];

  employeesLoading?: boolean;

  status: string;

  month: number;

  year: number;

  showEmployeeDropdown?: boolean;

  onEmployeeChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: string
  ) => void;

  onMonthChange: (
    value: number
  ) => void;

  onYearChange: (
    value: number
  ) => void;
};

/* ============================
   MONTHS
============================ */

const MONTHS = [
  {
    value: 1,
    label: "January",
  },

  {
    value: 2,
    label: "February",
  },

  {
    value: 3,
    label: "March",
  },

  {
    value: 4,
    label: "April",
  },

  {
    value: 5,
    label: "May",
  },

  {
    value: 6,
    label: "June",
  },

  {
    value: 7,
    label: "July",
  },

  {
    value: 8,
    label: "August",
  },

  {
    value: 9,
    label: "September",
  },

  {
    value: 10,
    label: "October",
  },

  {
    value: 11,
    label: "November",
  },

  {
    value: 12,
    label: "December",
  },
];

/* ============================
   PAYROLL CYCLE
============================ */

const getPayrollCycle =
  (
    month: number,
    year: number
  ) => {
    const start =
      new Date(
        year,
        month - 2,
        26
      );

    const end =
      new Date(
        year,
        month - 1,
        25
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
   COMPONENT
============================ */

export default function AttendanceFilters({
  employeeId,
  employees,
  employeesLoading = false,
  status,
  month,
  year,
  showEmployeeDropdown = true,
  onEmployeeChange,
  onStatusChange,
  onMonthChange,
  onYearChange,
}: Props) {
  const currentYear =
    new Date().getFullYear();

  const years = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

  const cycle =
    getPayrollCycle(
      month,
      year
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`grid gap-3 ${
          showEmployeeDropdown
            ? "md:grid-cols-4"
            : "md:grid-cols-3"
        }`}
      >
        {/* ============================
            EMPLOYEE DROPDOWN
        ============================ */}

        {showEmployeeDropdown && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Employee
            </label>

            <select
                value={
                  employeeId
                }
                disabled={
                  employeesLoading
                }
                onChange={(
                  event
                ) =>
                  onEmployeeChange(
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option
                  value=""
                  disabled
                >
                  {employeesLoading
                    ? "Loading employees..."
                    : "Select Employee"}
                </option>

                {employees.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name} ({item.employeeCode})
                    </option>
                  )
                )}
              </select>
          </div>
        )}

        {/* ============================
            STATUS
        ============================ */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </label>

          <select
            value={
              status
            }
            onChange={(
              event
            ) =>
              onStatusChange(
                event.target
                  .value
              )
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All Status
            </option>

            <option value="PRESENT">
              Present
            </option>

            <option value="LATE">
              Late
            </option>

            <option value="HALF_DAY">
              Half Day
            </option>

            <option value="ABSENT">
              Absent
            </option>

            <option value="LEAVE">
              Leave
            </option>

            <option value="HOLIDAY">
              Holiday
            </option>
          </select>
        </div>

        {/* ============================
            PAYROLL MONTH
        ============================ */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payroll Month
          </label>

          <select
            value={
              month
            }
            onChange={(
              event
            ) =>
              onMonthChange(
                Number(
                  event.target
                    .value
                )
              )
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {MONTHS.map(
              (
                item
              ) => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }
                >
                  {
                    item.label
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* ============================
            YEAR
        ============================ */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Payroll Year
          </label>

          <select
            value={
              year
            }
            onChange={(
              event
            ) =>
              onYearChange(
                Number(
                  event.target
                    .value
                )
              )
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {years.map(
              (
                item
              ) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* ============================
          CYCLE PREVIEW
      ============================ */}

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            Selected Attendance Cycle
          </p>

          <p className="mt-1 text-sm font-semibold text-blue-800">
            {formatDate(
              cycle.start
            )}{" "}
            —{" "}
            {formatDate(
              cycle.end
            )}
          </p>
        </div>

        <p className="text-xs text-blue-600">
          Attendance and payroll use the
          26th to 25th cycle.
        </p>
      </div>
    </div>
  );
}
