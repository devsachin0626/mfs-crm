import {
  useEffect,
  
  useState,
} from "react";



import {
  CalendarClock,
  ChevronDown,
  Eye,
  Filter,
  Layers3,
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
  getLeadSummary,
} from "../../services/lead.service";

import type {
  LeadSummary,
} from "../../types/lead.types";



import {
  getLeadSources,
} from "../../services/leadSource.service";

import {
  getEmployees,
} from "../../services/employee.service";

import LeadAgingBadge from "../../features/lead/LeadAgingBadge";

import LeadBulkActionBar from "../../features/lead/LeadBulkActionBar";

import LeadAllocationModal from "../../features/lead/LeadAllocationModal";

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

    const roleName = (() => {
  const role =
    loggedInEmployee?.role as unknown;

  if (typeof role === "string") {
    return role;
  }

  if (
    role &&
    typeof role === "object" &&
    "name" in role
  ) {
    return String(
      (role as { name: string }).name
    );
  }

  return "";
})();

const isEmployee =
  roleName === "EMPLOYEE";

const canFilterEmployee =
  roleName === "ADMIN" ||
  roleName === "HR" ||
  roleName === "TEAM_LEADER";

const canAllocatePool =
  roleName === "ADMIN" ||
  roleName === "HR";



  const {
    leads,
    loading,
    error,
    total,
    totalPages,
  } = useAppSelector(
    (state) =>
      state.lead
  );

  const [
  leadSummary,
  setLeadSummary,
] =
  useState<LeadSummary | null>(
    null
  );

  

  const [
  selectedIds,
  setSelectedIds,
] = useState<string[]>(
  []
);

const [
  smartView,
  setSmartView,
] = useState("");

const [
  bulkMessage,
  setBulkMessage,
] = useState("");

const [
  showAllocation,
  setShowAllocation,
] = useState(false);

const [
  refreshKey,
  setRefreshKey,
] = useState(0);

const toggleLead = (
  id: string
) => {
  setSelectedIds(
    (current) =>
      current.includes(id)
        ? current.filter(
            (item) =>
              item !== id
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
      selectedIds.length ===
      leads.length
    ) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(
      leads.map(
        (lead) =>
          lead.id
      )
    );
  };

  const loadLeadSummary =
  async () => {
    try {
      const response =
        await getLeadSummary();

      setLeadSummary(
        response.summary
      );
    } catch (
      error
    ) {
      console.error(
        "Lead summary error",
        error
      );
    }
  };

  

const handleBulkSuccess = (
  message: string
) => {
  setBulkMessage(message);

  setSelectedIds([]);

  setRefreshKey(
    (current) =>
      current + 1
  );
};

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("");

  const [
    source,
    setSource,
  ] = useState("");

  const [
    stage,
    setStage,
  ] = useState("");

  const [
    employeeId,
    setEmployeeId,
  ] = useState("");

  const [
    followUp,
    setFollowUp,
  ] = useState("");

  const [
    statuses,
    setStatuses,
  ] = useState<any[]>([]);

  const [
    sources,
    setSources,
  ] = useState<any[]>([]);

  const [
    employees,
    setEmployees,
  ] = useState<any[]>([]);

  /* =========================
      LOAD FILTER OPTIONS
  ========================= */

useEffect(() => {
  const loadFilters = async () => {
    /* ============================
       LOAD STATUSES
    ============================ */

    try {
      const statusResponse =
        await getLeadStatuses();

      setStatuses(
        statusResponse.leadStatuses ||
        []
      );
    } catch (error) {
      console.error(
        "Lead status error",
        error
      );

      setStatuses([]);
    }

    /* ============================
       LOAD SOURCES
    ============================ */

    try {
      const sourceResponse =
        await getLeadSources();

      setSources(
        sourceResponse.leadSources ||
        []
      );
    } catch (error) {
      console.error(
        "Lead source error",
        error
      );

      setSources([]);
    }

    /* ============================
       LOAD EMPLOYEES
    ============================ */

    try {
      const employeeResponse =
        await getEmployees({
          page: 1,
          limit: 100,
        });

      setEmployees(
        employeeResponse.employees ||
        []
      );
    } catch (error) {
      console.error(
        "Employee filter error",
        error
      );

      setEmployees([]);
    }
  };

  loadFilters();
}, []);


useEffect(() => {
  loadLeadSummary();
}, [
  refreshKey,
]);

  /* =========================
      FETCH LEADS
  ========================= */

useEffect(() => {
  dispatch(
    fetchLeads({
      page,

      limit: 10,

      search:
        search || undefined,

      status:
        status || undefined,

      source:
        source || undefined,

      stage:
        stage || undefined,

      employeeId:
        canFilterEmployee && employeeId || undefined,

      followUp:
        followUp
          ? (followUp as
              | "TODAY"
              | "OVERDUE")
          : undefined,

      smartView:
        smartView
          ? (smartView as
              | "MY_NEW"
              | "HOT"
              | "OVERDUE"
              | "UNASSIGNED"
              | "NO_FOLLOW_UP"
              | "CONVERTED"
              | "LOST")
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

  /* =========================
      PAGE SUMMARY
  ========================= */

  

  const resetFilters =
    () => {
      setPage(1);

      setSearch("");

      setStatus("");

      setSource("");

      setStage("");

      setEmployeeId("");

      setFollowUp("");
    };

  const showMyLeads =
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

      setFollowUp("");
    };

  const showToday =
    () => {
      setPage(1);

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
    };

  return (
    <div className="space-y-5">
      {showAllocation && (
        <LeadAllocationModal
          employees={
            employees
          }
          availableCount={
            leadSummary
              ?.unassigned ??
            0
          }
          onClose={() =>
            setShowAllocation(
              false
            )
          }
          onSuccess={(
            response
          ) => {
            setShowAllocation(
              false
            );

            setBulkMessage(
              response.message
            );

            setSelectedIds(
              []
            );

            setRefreshKey(
              (current) =>
                current + 1
            );
          }}
        />
      )}
      {/* ======================
          PAGE HEADER
      ====================== */}

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
            Manage leads,
            calling and
            follow-ups
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
           onClick={() => {
  setRefreshKey(
    (current) =>
      current + 1
  );
}}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw
              size={16}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/leads/create"
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            New Lead
          </button>

          {canAllocatePool && (
  <button
    type="button"
    onClick={() =>
      setShowAllocation(
        true
      )
    }
    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
  >
    <Layers3 size={17} />
    Allocate Leads
  </button>
)}

<button
  type="button"
  onClick={() =>
    navigate(
      "/leads/import"
    )
  }
  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
>
  <Upload size={17} />
  Import
</button>


        </div>
      </div>

      {/* ======================
          QUICK CARDS
      ====================== */}

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
  <QuickCard
    title="Total Leads"
    value={leadSummary?.total ?? 0}
    icon={<Users size={18} />}
  />

  <QuickCard
    title="New"
    value={leadSummary?.new ?? 0}
    icon={<UserPlus size={18} />}
  />

  <button
    type="button"
    onClick={showMyLeads}
    className="text-left"
  >
    <QuickCard
      title="My Leads"
      value={leadSummary?.myLeads ?? 0}
      icon={<UserCheck size={18} />}
      active={
        isEmployee ||
        employeeId === loggedInEmployee?.id
      }
    />
  </button>

  <button
    type="button"
    onClick={showToday}
    className="text-left"
  >
    <QuickCard
      title="Today Follow-ups"
      value={
        leadSummary?.todayFollowUps ?? 0
      }
      icon={<CalendarClock size={18} />}
      active={followUp === "TODAY"}
    />
  </button>

  <button
    type="button"
    onClick={showOverdue}
    className="text-left"
  >
    <QuickCard
      title="Overdue"
      value={
        leadSummary?.overdueFollowUps ?? 0
      }
      icon={<XCircle size={18} />}
      active={followUp === "OVERDUE"}
    />
  </button>

  <QuickCard
    title="Converted"
    value={leadSummary?.converted ?? 0}
    icon={<UserCheck size={18} />}
  />
</div>


      {/* Smart Views */}
<div className="rounded-xl border border-slate-200 bg-white p-4">
  <div className="flex flex-wrap gap-2">
    {[
      ["", "All Leads"],
      ["MY_NEW", "My New Leads"],
      ["HOT", "Hot Leads"],
      ["OVERDUE", "Overdue"],
      ["UNASSIGNED", "Unassigned"],
      ["NO_FOLLOW_UP", "No Follow-up"],
      ["CONVERTED", "Converted"],
      ["LOST", "Lost"],
    ].map(([value, label]) => (
      <button
        key={value}
        type="button"
        onClick={() => {
          setPage(1);
          setSmartView(value);
        }}
        className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
          smartView === value
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
</div>

      {/* ======================
          FILTER TOOLBAR
      ====================== */}

      <div className="rounded-xl border border-slate-200 bg-white">
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

        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-6">
          {/* Search */}

          <div className="relative xl:col-span-2">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setPage(1);

                setSearch(
                  e.target
                    .value
                );
              }}
              placeholder="Search lead, mobile, email..."
              className={`${inputClass} pl-9`}
            />
          </div>

          {/* Status */}

          <select
            value={status}
            onChange={(e) => {
              setPage(1);

              setStatus(
                e.target.value
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
              (item) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.name
                  }
                >
                  {item.name}
                </option>
              )
            )}
          </select>

          {/* Stage */}

          <select
            value={stage}
            onChange={(e) => {
              setPage(1);

              setStage(
                e.target.value
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


          

          {/* Source */}

          <select
            value={source}
            onChange={(e) => {
              setPage(1);

              setSource(
                e.target.value
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
              (item) => (
                <option
                  key={
                    item.id
                  }
                  value={
                    item.name
                  }
                >
                  {item.name}
                </option>
              )
            )}
          </select>

          {/* Employee */}

      {canFilterEmployee && (
  <select
    value={employeeId}
    onChange={(e) => {
      setPage(1);

      setEmployeeId(
        e.target.value
      );
    }}
    className={inputClass}
  >
    <option value="">
      All Accessible Employees
    </option>

    {employees.map(
      (item) => (
        <option
          key={item.id}
          value={item.id}
        >
          {item.name}
          {" - "}
          {item.employeeCode}
        </option>
      )
    )}
  </select>
)}
        </div>
      </div>

      {bulkMessage && (
  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
    {bulkMessage}
  </div>
)}

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
    setSelectedIds([])
  }
  onSuccess={
    handleBulkSuccess
  }
/>

      {/* ======================
          TABLE
      ====================== */}
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
              {/* Select All */}
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    leads.length > 0 &&
                    leads.every((lead) =>
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
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className={`border-t border-slate-100 hover:bg-blue-50/30 ${
                  selectedIds.includes(
                    lead.id
                  )
                    ? "bg-blue-50/50"
                    : ""
                }`}
              >
                {/* Select Lead */}
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

                {/* Lead */}
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
                      {lead.leadCode}
                    </p>
                  </button>
                </td>

                {/* Contact */}
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-700">
                    {lead.mobile}
                  </p>

                  <p className="mt-0.5 max-w-45 truncate text-xs text-slate-400">
                    {lead.email ||
                      "-"}
                  </p>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge
                    name={
                      lead.status?.name ||
                      "-"
                    }
                    color={
                      lead.status?.color
                    }
                  />
                </td>

                {/* Stage */}
                <td className="px-4 py-3">
                  <StageBadge
                    stage={
                      lead.stage
                    }
                  />
                </td>



                <td className="px-4 py-3">
  <LeadAgingBadge
    aging={
      lead.aging
    }
  />
</td>

                {/* Employee */}
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

                {/* Source */}
                <td className="px-4 py-3 text-sm text-slate-600">
                  {lead.source?.name ||
                    "-"}
                </td>

                {/* Follow-up */}
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

                {/* Last Call */}
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

                {/* Actions */}
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
            ))}
          </tbody>
        </table>
      </div>

      {leads.length === 0 && (
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

  {/* Footer */}
  {!loading &&
    !error &&
    totalPages > 0 && (
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Showing page {page} of{" "}
          {totalPages} • {total} records
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage(
                (current) =>
                  current - 1
              )
            }
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage(
                (current) =>
                  current + 1
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

/* =========================
    STYLES
========================= */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

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
  icon: React.ReactNode;
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


    LOST:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[stage] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {stage.replace(
        "_",
        " "
      )}
    </span>
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