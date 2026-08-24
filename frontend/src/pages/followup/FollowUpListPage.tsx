import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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

/* ============================
   VIEW TYPE
============================ */

type FollowUpPageView =
  | FollowUpView
  | "COMPLETED"
  | "ALL";

/* ============================
   EMPLOYEE OPTION
============================ */

interface EmployeeOption {
  id: string;
  name: string;
  employeeCode: string;
}

/* ============================
   COUNTS
============================ */

interface FollowUpCounts {
  today: number;
  overdue: number;
  upcoming: number;
  completed: number;
}

/* ============================
   ROLE
============================ */

function getRoleName(
  role: unknown
): string {
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
    const value =
      (
        role as {
          name?: unknown;
        }
      ).name;

    if (
      typeof value ===
      "string"
    ) {
      return value;
    }
  }

  return "";
}

/* ============================
   PAGE
============================ */

export default function FollowUpListPage() {
  const navigate =
    useNavigate();

  const loggedInEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const roleName =
    getRoleName(
      loggedInEmployee?.role
    );

  const isEmployee =
    roleName ===
    "EMPLOYEE";

  const canFilterEmployee =
    roleName === "ADMIN" ||
    roleName === "HR" ||
    roleName ===
      "TEAM_LEADER";

  const [
    followUps,
    setFollowUps,
  ] =
    useState<FollowUp[]>(
      []
    );

  const [
    employees,
    setEmployees,
  ] =
    useState<
      EmployeeOption[]
    >([]);

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    total,
    setTotal,
  ] =
    useState(0);

  const [
    totalPages,
    setTotalPages,
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
    employeeId,
    setEmployeeId,
  ] =
    useState("");

  const [
    activeView,
    setActiveView,
  ] =
    useState<FollowUpPageView>(
      "TODAY"
    );

  const [
    counts,
    setCounts,
  ] =
    useState<FollowUpCounts>({
      today: 0,
      overdue: 0,
      upcoming: 0,
      completed: 0,
    });

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    loadingCounts,
    setLoadingCounts,
  ] =
    useState(false);

  const [
    completingId,
    setCompletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  /* ============================
     EFFECTIVE EMPLOYEE FILTER
  ============================ */

  const effectiveEmployeeId =
    isEmployee
      ? loggedInEmployee
          ?.id ||
        undefined
      : employeeId ||
        undefined;

  /* ============================
     SEARCH DEBOUNCE
  ============================ */

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          setPage(1);

          setSearch(
            searchInput.trim()
          );
        },
        400
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    searchInput,
  ]);

  /* ============================
     LOAD EMPLOYEES
  ============================ */

  useEffect(() => {
    if (
      !canFilterEmployee
    ) {
      return;
    }

    const loadEmployees =
      async () => {
        try {
          const response =
            await getEmployees({
              page: 1,
              limit: 100,
            });

          setEmployees(
            (
              response.employees ||
              []
            ).map(
              (
                employee: any
              ) => ({
                id:
                  employee.id,

                name:
                  employee.name,

                employeeCode:
                  employee.employeeCode,
              })
            )
          );
        } catch (
          error
        ) {
          console.error(
            "Employee load error",
            error
          );
        }
      };

    loadEmployees();
  }, [
    canFilterEmployee,
  ]);

  /* ============================
     LOAD FOLLOW UPS
  ============================ */

  const loadFollowUps =
    useCallback(
      async () => {
        if (
          !loggedInEmployee?.id
        ) {
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
            await getFollowUps({
              page,

              limit: 10,

              search:
                search ||
                undefined,

              employeeId:
                effectiveEmployeeId,

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
            });

          setFollowUps(
            response.followUps ||
              []
          );

          setTotal(
            response.total ||
              0
          );

          setTotalPages(
            Math.max(
              response.totalPages ||
                1,
              1
            )
          );
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data
              ?.message ||
            error?.message ||
            "Failed to load follow-ups"
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        loggedInEmployee?.id,
        page,
        search,
        effectiveEmployeeId,
        activeView,
      ]
    );

  useEffect(() => {
    loadFollowUps();
  }, [
    loadFollowUps,
  ]);

  /* ============================
     COUNTS
  ============================ */

  const loadCounts =
    useCallback(
      async () => {
        if (
          !loggedInEmployee?.id
        ) {
          return;
        }

        try {
          setLoadingCounts(
            true
          );

          const common = {
            page: 1,
            limit: 1,
            search:
              search ||
              undefined,
            employeeId:
              effectiveEmployeeId,
          };

          const [
            today,
            overdue,
            upcoming,
            completed,
          ] =
            await Promise.all([
              getFollowUps({
                ...common,
                view:
                  "TODAY",
                isCompleted:
                  false,
              }),

              getFollowUps({
                ...common,
                view:
                  "OVERDUE",
                isCompleted:
                  false,
              }),

              getFollowUps({
                ...common,
                view:
                  "UPCOMING",
                isCompleted:
                  false,
              }),

              getFollowUps({
                ...common,
                isCompleted:
                  true,
              }),
            ]);

          setCounts({
            today:
              today.total ||
              0,

            overdue:
              overdue.total ||
              0,

            upcoming:
              upcoming.total ||
              0,

            completed:
              completed.total ||
              0,
          });
        } catch (
          error
        ) {
          console.error(
            "Follow-up count error",
            error
          );
        } finally {
          setLoadingCounts(
            false
          );
        }
      },
      [
        loggedInEmployee?.id,
        search,
        effectiveEmployeeId,
      ]
    );

  useEffect(() => {
    loadCounts();
  }, [
    loadCounts,
  ]);

  /* ============================
     COMPLETE FOLLOW-UP
  ============================ */

  const handleComplete =
    async (
      id: string
    ) => {
      const confirmed =
        window.confirm(
          "Mark this follow-up as completed?"
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setCompletingId(
          id
        );

        setError(
          ""
        );

        setSuccessMessage(
          ""
        );

        await completeFollowUp(
          id
        );

        setSuccessMessage(
          "Follow-up completed successfully"
        );

        /*
         * Current active views se
         * completed item local remove.
         */

        if (
          activeView !==
            "COMPLETED" &&
          activeView !==
            "ALL"
        ) {
          setFollowUps(
            (
              current
            ) =>
              current.filter(
                (
                  item
                ) =>
                  item.id !==
                  id
              )
          );

          setTotal(
            (
              current
            ) =>
              Math.max(
                current -
                  1,
                0
              )
          );
        } else {
          setFollowUps(
            (
              current
            ) =>
              current.map(
                (
                  item
                ) =>
                  item.id ===
                  id
                    ? {
                        ...item,
                        isCompleted:
                          true,
                      }
                    : item
              )
          );
        }

        await loadCounts();

        /*
         * Page empty ho gaya to
         * previous page par jao.
         */

        if (
          followUps.length ===
            1 &&
          page > 1
        ) {
          setPage(
            (
              current
            ) =>
              Math.max(
                current - 1,
                1
              )
          );
        }
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Failed to complete follow-up"
        );
      } finally {
        setCompletingId(
          null
        );
      }
    };

  /* ============================
     VIEW
  ============================ */

  const selectView = (
    view:
      FollowUpPageView
  ) => {
    setPage(
      1
    );

    setActiveView(
      view
    );

    setSuccessMessage(
      ""
    );
  };

  /* ============================
     MY FOLLOW UPS
  ============================ */

  const showMyFollowUps =
    () => {
      if (
        !loggedInEmployee?.id
      ) {
        return;
      }

      setPage(
        1
      );

      setEmployeeId(
        loggedInEmployee.id
      );

      setActiveView(
        "TODAY"
      );
    };

  /* ============================
     TOTAL ACTIVE
  ============================ */

  const activePendingCount =
    useMemo(
      () =>
        counts.today +
        counts.overdue +
        counts.upcoming,
      [
        counts,
      ]
    );

  /* ============================
     NO USER
  ============================ */

  if (
    !loggedInEmployee?.id
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Logged-in employee information not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Follow-ups
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage scheduled lead follow-ups
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEmployee && (
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
          )}

          <button
            type="button"
            disabled={
              loading
            }
            onClick={() => {
              loadFollowUps();
              loadCounts();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
        </div>
      </div>

      {/* ============================
          SUMMARY
      ============================ */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Pending Follow-ups"
          value={
            activePendingCount
          }
          description="Today + overdue + upcoming"
        />

        <SummaryCard
          title="Today"
          value={
            counts.today
          }
          description="Scheduled today"
        />

        <SummaryCard
          title="Overdue"
          value={
            counts.overdue
          }
          description="Requires attention"
        />

        <SummaryCard
          title="Completed"
          value={
            counts.completed
          }
          description="Completed follow-ups"
        />
      </div>

      {/* ============================
          VIEW FILTERS
      ============================ */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ViewCard
          title="Today"
          count={
            counts.today
          }
          loading={
            loadingCounts
          }
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
          count={
            counts.overdue
          }
          loading={
            loadingCounts
          }
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
          count={
            counts.upcoming
          }
          loading={
            loadingCounts
          }
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
          count={
            counts.completed
          }
          loading={
            loadingCounts
          }
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
          count={
            undefined
          }
          loading={
            false
          }
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

      {/* ============================
          FILTERS
      ============================ */}

      <section
        className={`grid gap-3 rounded-xl border border-slate-200 bg-white p-4 ${
          canFilterEmployee
            ? "lg:grid-cols-[1fr_260px]"
            : ""
        }`}
      >
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={
              searchInput
            }
            onChange={(
              e
            ) =>
              setSearchInput(
                e.target.value
              )
            }
            placeholder="Search lead, mobile or lead code..."
            className={`${inputClass} pl-9`}
          />
        </div>

        {canFilterEmployee && (
          <select
            value={
              employeeId
            }
            onChange={(
              e
            ) => {
              setPage(
                1
              );

              setEmployeeId(
                e.target
                  .value
              );
            }}
            className={
              inputClass
            }
          >
            <option value="">
              All Accessible Employees
            </option>

            {employees.map(
              (
                employee
              ) => (
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
        )}
      </section>

      {/* ============================
          MESSAGES
      ============================ */}

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

      {/* ============================
          LIST
      ============================ */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <LoadingState />
        ) : followUps.length ===
          0 ? (
          <EmptyState
            view={
              activeView
            }
          />
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
                    ) => {
                      const overdue =
                        !item.isCompleted &&
                        isOverdue(
                          item.followUpDate
                        );

                      const today =
                        !item.isCompleted &&
                        isToday(
                          item.followUpDate
                        );

                      return (
                        <tr
                          key={
                            item.id
                          }
                          className="border-t border-slate-100 hover:bg-blue-50/30"
                        >
                          {/* LEAD */}

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

                              <p className="mt-0.5 text-xs text-slate-400">
                                {
                                  item
                                    .lead
                                    .leadCode
                                }
                              </p>
                            </button>
                          </td>

                          {/* CONTACT */}

                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-slate-700">
                              {
                                item
                                  .lead
                                  .mobile
                              }
                            </p>

                            <p className="max-w-48 truncate text-xs text-slate-400">
                              {item
                                .lead
                                .email ||
                                "-"}
                            </p>
                          </td>

                          {/* DATE */}

                          <td className="px-4 py-3">
                            <p
                              className={
                                overdue
                                  ? "text-sm font-semibold text-red-600"
                                  : today
                                    ? "text-sm font-semibold text-amber-600"
                                    : "text-sm font-medium text-slate-700"
                              }
                            >
                              {formatDate(
                                item.followUpDate
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatTime(
                                item.followUpDate
                              )}
                            </p>
                          </td>

                          {/* REMARKS */}

                          <td className="max-w-64 px-4 py-3">
                            <p className="line-clamp-2 text-sm text-slate-600">
                              {item.remarks ||
                                "-"}
                            </p>
                          </td>

                          {/* EMPLOYEE */}

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
                                item
                                  .lead
                                  .assignedEmployee
                                  ?.employeeCode ||
                                ""}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3">
                            {item.isCompleted ? (
                              <StatusBadge
                                type="COMPLETED"
                              />
                            ) : overdue ? (
                              <StatusBadge
                                type="OVERDUE"
                              />
                            ) : today ? (
                              <StatusBadge
                                type="TODAY"
                              />
                            ) : (
                              <StatusBadge
                                type="PENDING"
                              />
                            )}
                          </td>

                          {/* ACTIONS */}

                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {/* PHONE */}

                              <a
                                href={`tel:${item.lead.mobile}`}
                                title="Call"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Phone
                                  size={15}
                                />
                              </a>

                              {/* CALLING WORKSPACE */}

                              {!item.isCompleted && (
                                <button
                                  type="button"
                                  title="Open Calling Workspace"
                                 onClick={() =>
  navigate(
    `/calling?leadId=${item.lead.id}`
  )
}
                                  className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                >
                                  Calling
                                </button>
                              )}

                              {/* DETAILS */}

                              <button
                                type="button"
                                title="Lead Details"
                                onClick={() =>
                                  navigate(
                                    `/leads/${item.lead.id}`
                                  )
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                              >
                                <Eye
                                  size={15}
                                />
                              </button>

                              {/* COMPLETE */}

                              {!item.isCompleted && (
                                <button
                                  type="button"
                                  disabled={
                                    completingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    handleComplete(
                                      item.id
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  <CheckCircle2
                                    size={14}
                                  />

                                  {completingId ===
                                  item.id
                                    ? "Saving..."
                                    : "Complete"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* ============================
                PAGINATION
            ============================ */}

            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-500">
                Page {page} of{" "}
                {totalPages} •{" "}
                {total} follow-ups
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
                        Math.max(
                          current -
                            1,
                          1
                        )
                    )
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
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
                        Math.min(
                          current +
                            1,
                          totalPages
                        )
                    )
                  }
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  Next
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
   SUMMARY CARD
============================ */

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ============================
   VIEW CARD
============================ */

function ViewCard({
  title,
  count,
  loading,
  icon,
  active,
  onClick,
}: {
  title: string;

  count?: number;

  loading: boolean;

  icon: ReactNode;

  active: boolean;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={
        active
          ? "rounded-xl border border-blue-300 bg-blue-50 p-4 text-left text-blue-700"
          : "rounded-xl border border-slate-200 bg-white p-4 text-left text-slate-700 hover:bg-slate-50"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={
            active
              ? "rounded-lg bg-blue-100 p-2"
              : "rounded-lg bg-slate-100 p-2"
          }
        >
          {icon}
        </div>

        {count !==
          undefined && (
          <span className="text-lg font-bold">
            {loading
              ? "..."
              : count}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>
    </button>
  );
}

/* ============================
   STATUS BADGE
============================ */

function StatusBadge({
  type,
}: {
  type:
    | "COMPLETED"
    | "OVERDUE"
    | "TODAY"
    | "PENDING";
}) {
  if (
    type ===
    "COMPLETED"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2
          size={13}
        />

        Completed
      </span>
    );
  }

  if (
    type ===
    "OVERDUE"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        <XCircle
          size={13}
        />

        Overdue
      </span>
    );
  }

  if (
    type ===
    "TODAY"
  ) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <CalendarClock
          size={13}
        />

        Today
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
      <Clock3
        size={13}
      />

      Pending
    </span>
  );
}

/* ============================
   TABLE HEAD
============================ */

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ============================
   LOADING
============================ */

function LoadingState() {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

      <p className="mt-3 text-sm text-slate-500">
        Loading follow-ups...
      </p>
    </div>
  );
}

/* ============================
   EMPTY
============================ */

function EmptyState({
  view,
}: {
  view:
    FollowUpPageView;
}) {
  return (
    <div className="p-14 text-center">
      <CalendarClock
        size={40}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 font-semibold text-slate-700">
        No Follow-ups Found
      </p>

      <p className="mt-1 text-sm text-slate-400">
        No follow-ups found for{" "}
        {view
          .replace(
            /_/g,
            " "
          )
          .toLowerCase()}
        .
      </p>
    </div>
  );
}

/* ============================
   DATE HELPERS
============================ */

function isOverdue(
  value: string
) {
  return (
    new Date(
      value
    ).getTime() <
    Date.now()
  );
}

function isToday(
  value: string
) {
  const date =
    new Date(
      value
    );

  const today =
    new Date();

  return (
    date.getFullYear() ===
      today.getFullYear() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getDate() ===
      today.getDate()
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
      minute: "2-digit",
    }
  );
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";