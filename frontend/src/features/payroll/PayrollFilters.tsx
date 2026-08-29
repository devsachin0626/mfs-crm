import {
  Search,
} from "lucide-react";

/* ============================
   PROPS
============================ */

type Props = {
  search: string;

  month: number;

  year: number;

  status: string;

  onSearchChange: (
    value: string
  ) => void;

  onMonthChange: (
    value: number
  ) => void;

  onYearChange: (
    value: number
  ) => void;

  onStatusChange: (
    value: string
  ) => void;
};

/* ============================
   MONTHS
============================ */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ============================
   PAYROLL CYCLE
============================ */

function getPayrollCycle(
  month: number,
  year: number
) {
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
}

/* ============================
   COMPONENT
============================ */

export default function PayrollFilters({
  search,
  month,
  year,
  status,
  onSearchChange,
  onMonthChange,
  onYearChange,
  onStatusChange,
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
      {/* ============================
          FILTERS
      ============================ */}

      <div className="grid gap-3 md:grid-cols-4">
        {/* SEARCH */}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Employee
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                event
              ) =>
                onSearchChange(
                  event.target
                    .value
                )
              }
              placeholder="Search employee..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* PAYROLL MONTH */}

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
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {MONTHS.map(
              (
                name,
                index
              ) => (
                <option
                  key={
                    name
                  }
                  value={
                    index + 1
                  }
                >
                  {name}
                </option>
              )
            )}
          </select>
        </div>

        {/* YEAR */}

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
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

        {/* STATUS */}

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
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All Status
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="GENERATED">
              Generated
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="PAID">
              Paid
            </option>
          </select>
        </div>
      </div>

      {/* ============================
          CYCLE PREVIEW
      ============================ */}

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
            Selected Payroll Cycle
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
          Payroll follows the
          26th → 25th cycle.
        </p>
      </div>
    </div>
  );
}

/* ============================
   DATE FORMAT
============================ */

function formatDate(
  value: Date
) {
  return value.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
}