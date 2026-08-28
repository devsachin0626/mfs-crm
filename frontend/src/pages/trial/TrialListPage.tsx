import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Timer,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchTrials,
} from "../../store/slices/trialSlice";

import type {
  Trial,
  TrialStatus,
} from "../../types/trial.types";

/* ============================
   CONSTANTS
============================ */

const PAGE_LIMIT = 10;

const STATUS_OPTIONS: Array<{
  label: string;
  value: TrialStatus | "";
}> = [
  {
    label: "All Status",
    value: "",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
  {
    label: "Expired",
    value: "EXPIRED",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
  },
];

/* ============================
   PAGE
============================ */

export default function TrialListPage() {
  const dispatch =
    useAppDispatch();

  const navigate =
    useNavigate();

  const {
    trials,
    total,
    totalPages,
    loading,
    error,
  } =
    useAppSelector(
      (state) =>
        state.trial
    );

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
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
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState<
      TrialStatus | ""
    >("");

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

  const isEmployee =
    roleName ===
    "EMPLOYEE";

  const scopeTitle =
    roleName === "ADMIN" ||
    roleName === "HR"
      ? "Company Trials"
      : roleName ===
          "TEAM_LEADER"
        ? "Team Trials"
        : "My Trials";

  /* ============================
     FETCH
  ============================ */

  useEffect(() => {
    dispatch(
      fetchTrials({
        page,

        limit:
          PAGE_LIMIT,

        search:
          search ||
          undefined,

        status:
          status ||
          undefined,
      })
    );
  }, [
    dispatch,
    page,
    search,
    status,
  ]);

  /* ============================
     SEARCH
  ============================ */

  const handleSearch = (
    event:
      React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchInput.trim()
    );
  };

  const clearSearch =
    () => {
      setSearchInput("");

      setSearch("");

      setPage(1);
    };

  /* ============================
     REFRESH
  ============================ */

  const handleRefresh =
    () => {
      dispatch(
        fetchTrials({
          page,

          limit:
            PAGE_LIMIT,

          search:
            search ||
            undefined,

          status:
            status ||
            undefined,
        })
      );
    };

  /* ============================
     PAGE SUMMARY
  ============================ */

  const pageSummary =
    useMemo(() => {
      let active = 0;
      let completed = 0;
      let expired = 0;

      trials.forEach(
        (trial) => {
          if (
            trial.status ===
            "ACTIVE"
          ) {
            active += 1;
          }

          if (
            trial.status ===
            "COMPLETED"
          ) {
            completed += 1;
          }

          if (
            trial.status ===
            "EXPIRED"
          ) {
            expired += 1;
          }
        }
      );

      return {
        active,
        completed,
        expired,
      };
    }, [trials]);

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Demo Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {scopeTitle}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage Lead demos,
            trial duration,
            expiry and progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              loading
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/trials/create"
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Plus
              size={17}
            />

            Start Demo
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-semibold text-red-700">
            Unable to load trials
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Trials"
          value={total}
          description={
            isEmployee
              ? "Your accessible trials"
              : "Accessible trials"
          }
          icon={
            <Timer
              size={20}
            />
          }
        />

        <SummaryCard
          title="Active"
          value={
            pageSummary.active
          }
          description="Active on current page"
          icon={
            <CalendarClock
              size={20}
            />
          }
        />

        <SummaryCard
          title="Completed"
          value={
            pageSummary.completed
          }
          description="Completed on current page"
          icon={
            <Timer
              size={20}
            />
          }
        />

        <SummaryCard
          title="Expired"
          value={
            pageSummary.expired
          }
          description="Expired on current page"
          icon={
            <CalendarClock
              size={20}
            />
          }
        />
      </div>

      {/* FILTERS */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form
            onSubmit={
              handleSearch
            }
            className="flex flex-1 gap-2"
          >
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
                placeholder="Search trial, lead, mobile, client, product..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>

            {(search ||
              searchInput) && (
              <button
                type="button"
                onClick={
                  clearSearch
                }
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </form>

          <select
            value={status}
            onChange={(
              event
            ) => {
              setPage(1);

              setStatus(
                event.target
                  .value as
                  | TrialStatus
                  | ""
              );
            }}
            className="min-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {STATUS_OPTIONS.map(
              (option) => (
                <option
                  key={
                    option.value ||
                    "ALL"
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Trial Records
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {total}{" "}
              {total === 1
                ? "record"
                : "records"}
            </p>
          </div>

          {status && (
            <StatusBadge
              status={
                status
              }
            />
          )}
        </div>

        {loading &&
        trials.length === 0 ? (
          <TableLoading />
        ) : trials.length ===
          0 ? (
          <EmptyTrials
            onCreate={() =>
              navigate(
                "/trials/create"
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-100">
                    <TableHead>
                      Trial
                    </TableHead>

                    <TableHead>
                      Lead / Client
                    </TableHead>

                    <TableHead>
                      Product
                    </TableHead>

                    <TableHead>
                      Employee
                    </TableHead>

                    <TableHead>
                      Duration
                    </TableHead>

                    <TableHead>
                      End Date
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead align="right">
                      Action
                    </TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {trials.map(
                    (trial) => (
                      <TrialRow
                        key={
                          trial.id
                        }
                        trial={
                          trial
                        }
                        onOpen={() =>
                          navigate(
                            `/trials/${trial.id}`
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {Math.max(
                    totalPages,
                    1
                  )}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    page <= 1 ||
                    loading
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
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={16}
                  />

                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                      totalPages ||
                    totalPages ===
                      0 ||
                    loading
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
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================
   ROW
============================ */

function TrialRow({
  trial,
  onOpen,
}: {
  trial: Trial;
  onOpen: () => void;
}) {
  const subjectName =
    trial.lead?.name ||
    trial.client?.name ||
    "Unnamed";

  const subjectMobile =
    trial.lead?.mobile ||
    trial.client?.mobile ||
    "-";

  const subjectCode =
    trial.lead?.leadCode ||
    trial.client
      ?.clientCode ||
    "-";

  const subjectType =
    trial.lead
      ? "LEAD"
      : trial.client
        ? "CLIENT"
        : "-";

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="whitespace-nowrap px-5 py-4">
        <button
          type="button"
          onClick={onOpen}
          className="text-left"
        >
          <p className="text-sm font-semibold text-blue-700 hover:underline">
            {
              trial.trialCode
            }
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatDate(
              trial.startDate
            )}
          </p>
        </button>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-start gap-2">
          <div>
            <p className="max-w-48 truncate text-sm font-medium text-slate-800">
              {subjectName}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {subjectCode}
              {" · "}
              {subjectMobile}
            </p>
          </div>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              subjectType ===
              "LEAD"
                ? "bg-violet-50 text-violet-700"
                : subjectType ===
                    "CLIENT"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {subjectType}
          </span>
        </div>

        {trial.lead
          ?.isConverted && (
          <p className="mt-1 text-xs font-medium text-emerald-600">
            Lead Converted
          </p>
        )}
      </td>

     <td className="px-5 py-4">
  <p className="max-w-48 truncate text-sm font-medium text-slate-800">
    {trial.demoProduct?.name ||
      trial.product?.name ||
      "-"}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    {trial.demoProduct?.code ||
      trial.product?.productCode ||
      "-"}
  </p>

  {trial.demoProduct && (
    <p className="mt-1 text-[11px] font-medium text-blue-600">
      Demo Product
    </p>
  )}
</td>

      <td className="px-5 py-4">
        <p className="max-w-40 truncate text-sm text-slate-700">
          {trial.employee
            ?.name ||
            "-"}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {trial.employee
            ?.employeeCode ||
            "-"}
        </p>
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {
            trial.trialDays
          }{" "}
          days
        </p>

        {trial.extensionCount >
          0 && (
          <p className="mt-1 text-xs text-blue-600">
            Extended{" "}
            {
              trial.extensionCount
            }
            x
          </p>
        )}
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-sm text-slate-700">
          {formatDate(
            trial.endDate
          )}
        </p>

        {trial.status ===
          "ACTIVE" && (
          <p className="mt-1 text-xs text-slate-400">
            {getRemainingText(
              trial.endDate
            )}
          </p>
        )}
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <StatusBadge
          status={
            trial.status
          }
        />
      </td>

      <td className="whitespace-nowrap px-5 py-4 text-right">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Eye
            size={15}
          />

          View
        </button>
      </td>
    </tr>
  );
}

/* ============================
   STATUS BADGE
============================ */

function StatusBadge({
  status,
}: {
  status: TrialStatus;
}) {
  const styles: Record<
    TrialStatus,
    string
  > = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/10",

    COMPLETED:
      "bg-blue-50 text-blue-700 ring-blue-600/10",

    EXPIRED:
      "bg-amber-50 text-amber-700 ring-amber-600/10",

    CANCELLED:
      "bg-red-50 text-red-700 ring-red-600/10",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {formatStatus(
        status
      )}
    </span>
  );
}

/* ============================
   SUMMARY CARD
============================ */

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon:
    React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ============================
   TABLE HEAD
============================ */

function TableHead({
  children,
  align = "left",
}: {
  children:
    React.ReactNode;
  align?:
    | "left"
    | "right";
}) {
  return (
    <th
      className={`whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* ============================
   EMPTY
============================ */

function EmptyTrials({
  onCreate,
}: {
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Timer
          size={24}
        />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900">
        No trials found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        No demo matches the
        selected filters.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
      >
        <Plus
          size={16}
        />

        Start Demo
      </button>
    </div>
  );
}

/* ============================
   LOADING
============================ */

function TableLoading() {
  return (
    <div className="space-y-3 p-5">
      {[
        1,
        2,
        3,
        4,
        5,
      ].map(
        (item) => (
          <div
            key={item}
            className="h-16 animate-pulse rounded-lg bg-slate-100"
          />
        )
      )}
    </div>
  );
}

/* ============================
   FORMATTERS
============================ */

function formatStatus(
  status: TrialStatus
) {
  return status
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

function formatDate(
  value: string
) {
  const date =
    new Date(value);

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

function getRemainingText(
  value: string
) {
  const endDate =
    new Date(value);

  if (
    Number.isNaN(
      endDate.getTime()
    )
  ) {
    return "";
  }

  const difference =
    endDate.getTime() -
    Date.now();

  if (
    difference <= 0
  ) {
    return "Expired";
  }

  const days =
    Math.ceil(
      difference /
        (
          1000 *
          60 *
          60 *
          24
        )
    );

  if (days === 1) {
    return "1 day left";
  }

  return `${days} days left`;
}