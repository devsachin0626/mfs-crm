import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getEmployees,
} from "../../services/employee.service";

import {
  completeFollowUp,
  getFollowUps,
} from "../../services/followup.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  FollowUp,
  FollowUpView,
} from "../../types/followup.types";

export default function FollowUpListPage() {
  const navigate =
    useNavigate();

  const loggedInEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const [
    followUps,
    setFollowUps,
  ] =
    useState<
      FollowUp[]
    >([]);

  const [
    employees,
    setEmployees,
  ] =
    useState<any[]>([]);

  const [page, setPage] =
    useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    employeeId,
    setEmployeeId,
  ] = useState("");

  const [
    activeView,
    setActiveView,
  ] =
    useState<
      | FollowUpView
      | "COMPLETED"
      | "ALL"
    >("TODAY");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    completingId,
    setCompletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* =========================
     EMPLOYEES
  ========================= */

  useEffect(() => {
    const loadEmployees =
      async () => {
        try {
          const response =
            await getEmployees(
              {
                page: 1,
                limit: 100,
              }
            );

          setEmployees(
            response.employees ||
              []
          );
        } catch (
          error
        ) {
          console.error(
            error
          );
        }
      };

    loadEmployees();
  }, []);

  /* =========================
     LOAD FOLLOWUPS
  ========================= */

  const loadFollowUps =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getFollowUps(
              {
                page,

                limit: 10,

                search:
                  search ||
                  undefined,

                employeeId:
                  employeeId ||
                  undefined,

                view:
                  activeView ===
                    "TODAY" ||
                  activeView ===
                    "OVERDUE" ||
                  activeView ===
                    "UPCOMING"
                    ? activeView
                    : undefined,

                isCompleted:
                  activeView ===
                  "COMPLETED"
                    ? true
                    : activeView ===
                        "ALL"
                      ? undefined
                      : false,
              }
            );

          setFollowUps(
            response.followUps ||
              []
          );

          setTotal(
            response.total ||
              0
          );

          setTotalPages(
            response.totalPages ||
              1
          );
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data
              ?.message ||
              "Failed to load follow-ups"
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        employeeId,
        activeView,
      ]
    );

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  /* =========================
     COMPLETE
  ========================= */

  const handleComplete =
    async (
      id: string
    ) => {
      try {
        setCompletingId(
          id
        );

        setError("");
        setSuccessMessage(
          ""
        );

        await completeFollowUp(
          id
        );

        setSuccessMessage(
          "Follow-up completed successfully"
        );

        await loadFollowUps();
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to complete follow-up"
        );
      } finally {
        setCompletingId(
          null
        );
      }
    };

  const selectView = (
    view:
      | FollowUpView
      | "COMPLETED"
      | "ALL"
  ) => {
    setPage(1);

    setActiveView(
      view
    );
  };

  const showMyFollowUps =
    () => {
      if (
        !loggedInEmployee
          ?.id
      ) {
        return;
      }

      setPage(1);

      setEmployeeId(
        loggedInEmployee.id
      );

      setActiveView(
        "TODAY"
      );
    };

  return (
    <div className="space-y-5">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Follow-ups
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Daily calling and
            follow-up workspace
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={
              showMyFollowUps
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <UserRound
              size={16}
            />

            My Follow-ups
          </button>

          <button
            type="button"
            onClick={
              loadFollowUps
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              size={16}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* View Cards */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ViewCard
          title="Today"
          icon={
            <CalendarClock
              size={18}
            />
          }
          active={
            activeView ===
            "TODAY"
          }
          onClick={() =>
            selectView(
              "TODAY"
            )
          }
        />

        <ViewCard
          title="Overdue"
          icon={
            <XCircle
              size={18}
            />
          }
          active={
            activeView ===
            "OVERDUE"
          }
          onClick={() =>
            selectView(
              "OVERDUE"
            )
          }
        />

        <ViewCard
          title="Upcoming"
          icon={
            <Clock3
              size={18}
            />
          }
          active={
            activeView ===
            "UPCOMING"
          }
          onClick={() =>
            selectView(
              "UPCOMING"
            )
          }
        />

        <ViewCard
          title="Completed"
          icon={
            <CheckCircle2
              size={18}
            />
          }
          active={
            activeView ===
            "COMPLETED"
          }
          onClick={() =>
            selectView(
              "COMPLETED"
            )
          }
        />

        <ViewCard
          title="All"
          icon={
            <CalendarClock
              size={18}
            />
          }
          active={
            activeView ===
            "ALL"
          }
          onClick={() =>
            selectView(
              "ALL"
            )
          }
        />
      </div>

      {/* Filters */}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setPage(1);

              setSearch(
                e.target.value
              );
            }}
            placeholder="Search lead, mobile or lead code..."
            className={`${inputClass} pl-9`}
          />
        </div>

        <select
          value={
            employeeId
          }
          onChange={(e) => {
            setPage(1);

            setEmployeeId(
              e.target.value
            );
          }}
          className={
            inputClass
          }
        >
          <option value="">
            All Employees
          </option>

          {employees.map(
            (employee) => (
              <option
                key={
                  employee.id
                }
                value={
                  employee.id
                }
              >
                {
                  employee.name
                }
                {" - "}
                {
                  employee.employeeCode
                }
              </option>
            )
          )}
        </select>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {
            successMessage
          }
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading
              follow-ups...
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHead>
                      Lead
                    </TableHead>

                    <TableHead>
                      Contact
                    </TableHead>

                    <TableHead>
                      Follow-up
                    </TableHead>

                    <TableHead>
                      Remarks
                    </TableHead>

                    <TableHead>
                      Assigned To
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {followUps.map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                        className="border-t border-slate-100 hover:bg-blue-50/30"
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/leads/${item.lead.id}`
                              )
                            }
                            className="text-left"
                          >
                            <p className="text-sm font-semibold text-blue-600 hover:underline">
                              {item
                                .lead
                                .name ||
                                "Unnamed Lead"}
                            </p>

                            <p className="text-xs text-slate-400">
                              {
                                item
                                  .lead
                                  .leadCode
                              }
                            </p>
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">
                            {
                              item
                                .lead
                                .mobile
                            }
                          </p>

                          <p className="max-w-44 truncate text-xs text-slate-400">
                            {item
                              .lead
                              .email ||
                              "-"}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p
                            className={`text-sm font-medium ${
                              isOverdue(
                                item.followUpDate
                              ) &&
                              !item.isCompleted
                                ? "text-red-600"
                                : "text-slate-700"
                            }`}
                          >
                            {formatDate(
                              item.followUpDate
                            )}
                          </p>

                          <p className="text-xs text-slate-400">
                            {formatTime(
                              item.followUpDate
                            )}
                          </p>
                        </td>

                        <td className="max-w-60 px-4 py-3 text-sm text-slate-600">
                          <p className="line-clamp-2">
                            {item.remarks ||
                              "-"}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">
                            {item
                              .employee
                              ?.name ||
                              item
                                .lead
                                .assignedEmployee
                                ?.name ||
                              "-"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {item
                              .employee
                              ?.employeeCode ||
                              ""}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          {item.isCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2
                                size={
                                  13
                                }
                              />
                              Completed
                            </span>
                          ) : isOverdue(
                              item.followUpDate
                            ) ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              <XCircle
                                size={
                                  13
                                }
                              />
                              Overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              <Clock3
                                size={
                                  13
                                }
                              />
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`tel:${item.lead.mobile}`}
                              title="Call"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Phone
                                size={
                                  15
                                }
                              />
                            </a>

                            <button
                              type="button"
                              title="View Lead"
                              onClick={() =>
                                navigate(
                                  `/leads/${item.lead.id}`
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye
                                size={
                                  15
                                }
                              />
                            </button>

                            {!item.isCompleted && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleComplete(
                                    item.id
                                  )
                                }
                                disabled={
                                  completingId ===
                                  item.id
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {completingId ===
                                item.id
                                  ? "..."
                                  : "Complete"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {followUps.length ===
              0 && (
              <div className="p-12 text-center">
                <CalendarClock
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No follow-ups
                  found
                </p>
              </div>
            )}
          </>
        )}

        {!loading &&
          totalPages > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">
                Page {page} of{" "}
                {totalPages} •{" "}
                {total} records
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
                        current -
                        1
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium disabled:opacity-40"
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
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

function ViewCard({
  title,
  icon,
  active,
  onClick,
}: {
  title: string;

  icon:
    React.ReactNode;

  active: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg p-2.5 ${
            active
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-50 text-slate-600"
          }`}
        >
          {icon}
        </div>

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>
      </div>
    </button>
  );
}

function TableHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute:
        "2-digit",
    }
  );
}

function isOverdue(
  value: string
) {
  return (
    new Date(value) <
    new Date()
  );
}