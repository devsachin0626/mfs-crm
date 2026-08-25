import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  CalendarClock,
  ChevronDown,
  Eye,
  Filter,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  Users,
  Upload,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchLeads,
} from "../../store/slices/leadSlice";

import {
  getLeadStatuses,
} from "../../services/leadStatus.service";

import {
  getLeadSources,
} from "../../services/leadSource.service";

import {
  getEmployees,
} from "../../services/employee.service";

import LeadAgingBadge from "../../features/lead/LeadAgingBadge";

import LeadBulkActionBar from "../../features/lead/LeadBulkActionBar";

/* ============================
   SMART VIEW TYPE
============================ */

type SmartView =
  | ""
  | "MY_NEW"
  | "HOT"
  | "OVERDUE"
  | "UNASSIGNED"
  | "NO_FOLLOW_UP"
  | "CONVERTED"
  | "LOST";

/* ============================
   ROLE HELPER
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
    const name =
      (
        role as {
          name?: unknown;
        }
      ).name;

    if (
      typeof name ===
      "string"
    ) {
      return name;
    }
  }

  return "";
}

/* ============================
   PAGE
============================ */

export default function LeadListPage() {
  const dispatch =
    useAppDispatch();

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

  const canBulkManage =
    roleName === "ADMIN" ||
    roleName === "HR" ||
    roleName ===
      "TEAM_LEADER";

  const canImport =
    roleName === "ADMIN" ||
    roleName === "HR" ||
    roleName ===
      "TEAM_LEADER";

  const {
    leads,
    loading,
    error,
    total,
    totalPages,
  } =
    useAppSelector(
      (state) =>
        state.lead
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
    useState("");

  const [
    source,
    setSource,
  ] =
    useState("");

  const [
    stage,
    setStage,
  ] =
    useState("");

  const [
    employeeId,
    setEmployeeId,
  ] =
    useState("");

  const [
    followUp,
    setFollowUp,
  ] =
    useState("");

  const [
    smartView,
    setSmartView,
  ] =
    useState<SmartView>(
      ""
    );

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);

  /* ============================
     OPTION STATE
  ============================ */

  const [
    statuses,
    setStatuses,
  ] =
    useState<any[]>([]);

  const [
    sources,
    setSources,
  ] =
    useState<any[]>([]);

  const [
    employees,
    setEmployees,
  ] =
    useState<any[]>([]);

  /* ============================
     BULK STATE
  ============================ */

  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<string[]>(
      []
    );

  const [
    bulkMessage,
    setBulkMessage,
  ] =
    useState("");

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
     LOAD FILTER OPTIONS
  ============================ */

  useEffect(() => {
    const loadFilters =
      async () => {
        /* STATUS */

        try {
          const response =
            await getLeadStatuses();

          setStatuses(
            response.leadStatuses ||
              []
          );
        } catch (
          error
        ) {
          console.error(
            "Lead status error",
            error
          );

          setStatuses([]);
        }

        /* SOURCE */

        try {
          const response =
            await getLeadSources();

          setSources(
            response.leadSources ||
              []
          );
        } catch (
          error
        ) {
          console.error(
            "Lead source error",
            error
          );

          setSources([]);
        }

        /* EMPLOYEES */

        if (
          !canFilterEmployee
        ) {
          setEmployees([]);
          return;
        }

        try {
          const response =
            await getEmployees({
              page: 1,
              limit: 100,
            });

          setEmployees(
            response.employees ||
              []
          );
        } catch (
          error
        ) {
          console.error(
            "Employee filter error",
            error
          );

          setEmployees([]);
        }
      };

    loadFilters();
  }, [
    canFilterEmployee,
  ]);

  /* ============================
     FETCH LEADS
  ============================ */

  useEffect(() => {
    dispatch(
      fetchLeads({
        page,

        limit: 10,

        search:
          search ||
          undefined,

        status:
          status ||
          undefined,

        source:
          source ||
          undefined,

        stage:
          stage ||
          undefined,

        /*
         * Employee role backend
         * already restricts own leads.
         */

        employeeId:
          canFilterEmployee &&
          employeeId
            ? employeeId
            : undefined,

        followUp:
          followUp
            ? (
                followUp as
                  | "TODAY"
                  | "OVERDUE"
              )
            : undefined,

        smartView:
          smartView
            ? smartView
            : undefined,
      })
    );
  }, [
    dispatch,
    page,
    search,
    status,
    source,
    stage,
    employeeId,
    followUp,
    smartView,
    refreshKey,
    canFilterEmployee,
  ]);

  /* ============================
     CLEAR PAGE SELECTION
  ============================ */

  useEffect(() => {
    setSelectedIds([]);
  }, [
    page,
    search,
    status,
    source,
    stage,
    employeeId,
    followUp,
    smartView,
  ]);

  /* ============================
     CURRENT PAGE STATS
  ============================ */

  const stats =
    useMemo(() => {
      return {
        newLeads:
          leads.filter(
            (lead) =>
              lead.stage ===
              "NEW"
          ).length,

        converted:
          leads.filter(
            (lead) =>
              lead.stage ===
              "CONVERTED"
          ).length,

        lost:
          leads.filter(
            (lead) =>
              lead.stage ===
              "LOST"
          ).length,
      };
    }, [
      leads,
    ]);

  /* ============================
     BULK SELECT
  ============================ */

  const toggleLead = (
    id: string
  ) => {
    if (
      !canBulkManage
    ) {
      return;
    }

    setSelectedIds(
      (current) =>
        current.includes(
          id
        )
          ? current.filter(
              (item) =>
                item !==
                id
            )
          : [
              ...current,
              id,
            ]
    );
  };

  const selectAllCurrentPage =
    () => {
      if (
        !canBulkManage
      ) {
        return;
      }

      const allSelected =
        leads.length > 0 &&
        leads.every(
          (lead) =>
            selectedIds.includes(
              lead.id
            )
        );

      if (
        allSelected
      ) {
        setSelectedIds(
          []
        );

        return;
      }

      setSelectedIds(
        leads.map(
          (lead) =>
            lead.id
        )
      );
    };

  /* ============================
     BULK SUCCESS
  ============================ */

  const handleBulkSuccess =
    (
      message: string
    ) => {
      setBulkMessage(
        message
      );

      setSelectedIds(
        []
      );

      setRefreshKey(
        (current) =>
          current + 1
      );
    };

  /* ============================
     RESET FILTERS
  ============================ */

  const resetFilters =
    () => {
      setPage(1);

      setSearchInput(
        ""
      );

      setSearch(
        ""
      );

      setStatus(
        ""
      );

      setSource(
        ""
      );

      setStage(
        ""
      );

      setEmployeeId(
        ""
      );

      setFollowUp(
        ""
      );

      setSmartView(
        ""
      );

      setSelectedIds(
        []
      );

      setBulkMessage(
        ""
      );
    };

  /* ============================
     QUICK FILTERS
  ============================ */

  const showMyLeads =
    () => {
      setPage(1);

      setFollowUp(
        ""
      );

      setSmartView(
        ""
      );

      /*
       * Employee is already scoped
       * to own leads by backend.
       */

      if (
        isEmployee
      ) {
        setEmployeeId(
          ""
        );

        return;
      }

      if (
        loggedInEmployee?.id
      ) {
        setEmployeeId(
          loggedInEmployee.id
        );
      }
    };

  const showToday =
    () => {
      setPage(1);

      setSmartView(
        ""
      );

      setFollowUp(
        "TODAY"
      );
    };

  const showOverdue =
    () => {
      setPage(1);

      setFollowUp(
        "OVERDUE"
      );

      setSmartView(
        ""
      );
    };

  /* ============================
     REFRESH
  ============================ */

  const handleRefresh =
    () => {
      setBulkMessage(
        ""
      );

      setRefreshKey(
        (current) =>
          current + 1
      );
    };

  /* ============================
     SMART VIEWS
  ============================ */

  const smartViews: Array<{
    value: SmartView;
    label: string;
  }> = [
    {
      value: "",
      label:
        "All Leads",
    },

    {
      value:
        "MY_NEW",
      label:
        "My New Leads",
    },

    {
      value:
        "HOT",
      label:
        "Hot Leads",
    },

    {
      value:
        "OVERDUE",
      label:
        "Overdue",
    },

    ...(
      !isEmployee
        ? [
            {
              value:
                "UNASSIGNED" as SmartView,

              label:
                "Unassigned",
            },
          ]
        : []
    ),

    {
      value:
        "NO_FOLLOW_UP",
      label:
        "No Follow-up",
    },

    {
      value:
        "CONVERTED",
      label:
        "Converted",
    },

    {
      value:
        "LOST",
      label:
        "Lost",
    },
  ];

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Leads
            </h1>

            <ChevronDown
              size={18}
              className="text-slate-400"
            />
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage leads, calling and follow-ups
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              handleRefresh
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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

          {/* Employee can also create lead */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/leads/create"
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus
              size={17}
            />

            New Lead
          </button>

          {/* Employee cannot import */}

          {canImport && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/leads/import"
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Upload
                size={17}
              />

              Import
            </button>
          )}
        </div>
      </div>

      {/* ============================
          QUICK CARDS
      ============================ */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <QuickCard
          title="Total Leads"
          value={
            total
          }
          icon={
            <Users
              size={18}
            />
          }
        />

        <QuickCard
          title="New (This Page)"
          value={
            stats.newLeads
          }
          icon={
            <UserPlus
              size={18}
            />
          }
        />

        <button
          type="button"
          onClick={
            showMyLeads
          }
          className="text-left"
        >
          <QuickCard
            title="My Leads"
            value={
              isEmployee
                ? total
                : employeeId ===
                    loggedInEmployee
                      ?.id
                  ? total
                  : "-"
            }
            icon={
              <UserCheck
                size={18}
              />
            }
            active={
              isEmployee ||
              employeeId ===
                loggedInEmployee
                  ?.id
            }
          />
        </button>

        <button
          type="button"
          onClick={
            showToday
          }
          className="text-left"
        >
          <QuickCard
            title="Today Follow-ups"
            value={
              followUp ===
              "TODAY"
                ? total
                : "-"
            }
            icon={
              <CalendarClock
                size={18}
              />
            }
            active={
              followUp ===
              "TODAY"
            }
          />
        </button>

        <button
          type="button"
          onClick={
            showOverdue
          }
          className="text-left"
        >
          <QuickCard
            title="Overdue"
            value={
              followUp ===
              "OVERDUE"
                ? total
                : "-"
            }
            icon={
              <XCircle
                size={18}
              />
            }
            active={
              followUp ===
              "OVERDUE"
            }
          />
        </button>

        <QuickCard
          title="Converted (This Page)"
          value={
            stats.converted
          }
          icon={
            <UserCheck
              size={18}
            />
          }
        />
      </div>

      {/* ============================
          SMART VIEWS
      ============================ */}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {smartViews.map(
            ({
              value,
              label,
            }) => (
              <button
                key={
                  value ||
                  "ALL"
                }
                type="button"
                onClick={() => {
                  setPage(
                    1
                  );

                  setSmartView(
                    value
                  );

                  setFollowUp(
                    ""
                  );
                }}
                className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
                  smartView ===
                  value
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </section>

      {/* ============================
          FILTER TOOLBAR
      ============================ */}

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Filter
            size={17}
            className="text-slate-500"
          />

          <span className="text-sm font-semibold text-slate-700">
            Filters
          </span>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear All
          </button>
        </div>

        <div
          className={`grid gap-3 p-4 md:grid-cols-2 ${
            canFilterEmployee
              ? "xl:grid-cols-6"
              : "xl:grid-cols-5"
          }`}
        >
          {/* SEARCH */}

          <div className="relative xl:col-span-2">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
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
              placeholder="Search lead, mobile, email..."
              className={`${inputClass} pl-9`}
            />
          </div>

          {/* STATUS */}

          <select
            value={
              status
            }
            onChange={(
              event
            ) => {
              setPage(
                1
              );

              setStatus(
                event.target
                  .value
              );
            }}
            className={
              inputClass
            }
          >
            <option value="">
              All Status
            </option>

            {statuses.map(
              (
                item
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.name
                  }
                >
                  {
                    item.name
                  }
                </option>
              )
            )}
          </select>

          {/* STAGE */}

          <select
            value={
              stage
            }
            onChange={(
              event
            ) => {
              setPage(
                1
              );

              setStage(
                event.target
                  .value
              );
            }}
            className={
              inputClass
            }
          >
            <option value="">
              All Stage
            </option>

            <option value="NEW">
              New
            </option>

            <option value="WORKING">
              Working
            </option>

            <option value="FOLLOW_UP">
              Follow Up
            </option>

            <option value="CONVERTED">
              Converted
            </option>

            <option value="LOST">
              Lost
            </option>
          </select>

          {/* SOURCE */}

          <select
            value={
              source
            }
            onChange={(
              event
            ) => {
              setPage(
                1
              );

              setSource(
                event.target
                  .value
              );
            }}
            className={
              inputClass
            }
          >
            <option value="">
              All Sources
            </option>

            {sources.map(
              (
                item
              ) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.name
                  }
                >
                  {
                    item.name
                  }
                </option>
              )
            )}
          </select>

          {/* EMPLOYEE */}

          {canFilterEmployee && (
            <select
              value={
                employeeId
              }
              onChange={(
                event
              ) => {
                setPage(
                  1
                );

                setEmployeeId(
                  event.target
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
                  item
                ) => (
                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {
                      item.name
                    }
                    {" - "}
                    {
                      item.employeeCode
                    }
                  </option>
                )
              )}
            </select>
          )}
        </div>
      </section>

      {/* ============================
          BULK MESSAGE
      ============================ */}

      {bulkMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {
            bulkMessage
          }
        </div>
      )}

      {/* ============================
          BULK ACTION BAR

          Employee cannot use bulk
          assignment/status/stage.
      ============================ */}

      {canBulkManage && (
        <LeadBulkActionBar
          selectedIds={
            selectedIds
          }
          employees={
            employees
          }
          statuses={
            statuses
          }
          onClear={() =>
            setSelectedIds(
              []
            )
          }
          onSuccess={
            handleBulkSuccess
          }
        />
      )}

      {/* ============================
          TABLE
      ============================ */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading leads...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {canBulkManage && (
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            leads.length >
                              0 &&
                            leads.every(
                              (
                                lead
                              ) =>
                                selectedIds.includes(
                                  lead.id
                                )
                            )
                          }
                          onChange={
                            selectAllCurrentPage
                          }
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </th>
                    )}

                    <TableHead>
                      Lead
                    </TableHead>

                    <TableHead>
                      Contact
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      Stage
                    </TableHead>

                    <TableHead>
                      Priority
                    </TableHead>

                    <TableHead>
                      Assigned To
                    </TableHead>

                    <TableHead>
                      Source
                    </TableHead>

                    <TableHead>
                      Next Follow-up
                    </TableHead>

                    <TableHead>
                      Last Call
                    </TableHead>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map(
                    (
                      lead
                    ) => (
                      <tr
                        key={
                          lead.id
                        }
                        className={`border-t border-slate-100 hover:bg-blue-50/30 ${
                          selectedIds.includes(
                            lead.id
                          )
                            ? "bg-blue-50/50"
                            : ""
                        }`}
                      >
                        {/* SELECT */}

                        {canBulkManage && (
                          <td className="w-12 px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(
                                lead.id
                              )}
                              onChange={() =>
                                toggleLead(
                                  lead.id
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>
                        )}

                        {/* LEAD */}

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/leads/${lead.id}`
                              )
                            }
                            className="text-left"
                          >
                            <p className="text-sm font-semibold text-blue-600 hover:underline">
                              {lead.name ||
                                "Unnamed Lead"}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {
                                lead.leadCode
                              }
                            </p>
                          </button>
                        </td>

                        {/* CONTACT */}

                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">
                            {
                              lead.mobile
                            }
                          </p>

                          <p className="mt-0.5 max-w-45 truncate text-xs text-slate-400">
                            {lead.email ||
                              "-"}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-3">
                          <StatusBadge
                            name={
                              lead.status
                                ?.name ||
                              "-"
                            }
                            color={
                              lead.status
                                ?.color
                            }
                          />
                        </td>

                        {/* STAGE */}

                        <td className="px-4 py-3">
                          <StageBadge
                            stage={
                              lead.stage
                            }
                          />
                        </td>

                        {/* PRIORITY */}

                        <td className="px-4 py-3">
                          <LeadAgingBadge
                            aging={
                              lead.aging
                            }
                          />
                        </td>

                        {/* ASSIGNED */}

                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">
                            {lead
                              .assignedEmployee
                              ?.name ||
                              "Unassigned"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {lead
                              .assignedEmployee
                              ?.employeeCode ||
                              ""}
                          </p>
                        </td>

                        {/* SOURCE */}

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {lead.source
                            ?.name ||
                            "-"}
                        </td>

                        {/* FOLLOW-UP */}

                        <td className="px-4 py-3">
                          {lead.nextFollowUp ? (
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {formatDate(
                                  lead.nextFollowUp
                                )}
                              </p>

                              <p className="text-xs text-slate-400">
                                {formatTime(
                                  lead.nextFollowUp
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              -
                            </span>
                          )}
                        </td>

                        {/* LAST CALL */}

                        <td className="px-4 py-3">
                          {lead.lastCallAt ? (
                            <div>
                              <p className="text-sm text-slate-700">
                                {formatDate(
                                  lead.lastCallAt
                                )}
                              </p>

                              <p className="text-xs text-slate-400">
                                {formatTime(
                                  lead.lastCallAt
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Never
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`tel:${lead.mobile}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                              title="Call"
                            >
                              <Phone
                                size={15}
                              />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/leads/${lead.id}`
                                )
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50"
                              title="View"
                            >
                              <Eye
                                size={15}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* EMPTY */}

            {leads.length ===
              0 && (
              <div className="p-12 text-center">
                <Users
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No leads found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Change filters or create a new lead.
                </p>
              </div>
            )}
          </>
        )}

        {/* ============================
            PAGINATION
        ============================ */}

        {!loading &&
          !error &&
          totalPages > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Showing page{" "}
                {page} of{" "}
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
                        Math.max(
                          current -
                            1,
                          1
                        )
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
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
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
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

/* ============================
   STYLES
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

/* ============================
   QUICK CARD
============================ */

function QuickCard({
  title,
  value,
  icon,
  active = false,
}: {
  title: string;

  value:
    | number
    | string;

  icon:
    ReactNode;

  active?: boolean;
}) {
  return (
    <div
      className={`h-full rounded-xl border p-4 transition ${
        active
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 text-blue-600">
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
}: {
  children:
    ReactNode;
}) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ============================
   STATUS BADGE
============================ */

function StatusBadge({
  name,
  color,
}: {
  name: string;

  color?:
    | string
    | null;
}) {
  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor:
          color
            ? `${color}18`
            : "#f1f5f9",

        color:
          color ||
          "#475569",
      }}
    >
      {name}
    </span>
  );
}

/* ============================
   STAGE BADGE
============================ */

function StageBadge({
  stage,
}: {
  stage: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    NEW:
      "bg-blue-50 text-blue-700",

    WORKING:
      "bg-cyan-50 text-cyan-700",

    FOLLOW_UP:
      "bg-amber-50 text-amber-700",

    CONVERTED:
      "bg-emerald-50 text-emerald-700",

    LOST:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[
          stage
        ] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {stage.replace(
        /_/g,
        " "
      )}
    </span>
  );
}

/* ============================
   DATE
============================ */

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