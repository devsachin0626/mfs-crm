import {
  Search,
} from "lucide-react";

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

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(e) =>
            onSearchChange(
              e.target.value
            )
          }
          placeholder="Search employee..."
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <select
        value={month}
        onChange={(e) =>
          onMonthChange(
            Number(e.target.value)
          )
        }
        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      >
        {[
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
        ].map((name, index) => (
          <option
            key={name}
            value={index + 1}
          >
            {name}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) =>
          onYearChange(
            Number(e.target.value)
          )
        }
        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      >
        {[
          currentYear - 1,
          currentYear,
          currentYear + 1,
        ].map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) =>
          onStatusChange(
            e.target.value
          )
        }
        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      >
        <option value="">
          All Status
        </option>

        <option value="PENDING">
          Pending
        </option>

        <option value="PROCESSED">
          Processed
        </option>

        <option value="PAID">
          Paid
        </option>
      </select>
    </div>
  );
}