import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CalendarClock,
  Eye,
  GripVertical,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppSelector,
} from "../../hooks/redux";

import {
  getEmployees,
} from "../../services/employee.service";

import {
  changeLeadStage,
  getLeadPipeline,
} from "../../services/pipeline.service";

import type {
  Lead,
} from "../../types/lead.types";

import type {
  LeadPipeline,
  PipelineCounts,
  PipelineStage,
} from "../../types/pipeline.types";

import LeadAgingBadge from "../../features/lead/LeadAgingBadge";

const stages: {
  key: PipelineStage;
  label: string;
  description: string;
}[] = [
  {
    key: "NEW",
    label: "New",
    description:
      "Fresh leads",
  },

  {
    key: "WORKING",
    label: "Working",
    description:
      "Currently working",
  },

  {
    key: "FOLLOW_UP",
    label: "Follow Up",
    description:
      "Follow-up required",
  },

  {
    key: "CONVERTED",
    label: "Converted",
    description:
      "Converted clients",
  },

  {
    key: "LOST",
    label: "Lost",
    description:
      "Closed / lost",
  },
];

const emptyPipeline: LeadPipeline = {
  NEW: [],
  WORKING: [],
  FOLLOW_UP: [],
  CONVERTED: [],
  LOST: [],
};

const emptyCounts: PipelineCounts = {
  NEW: 0,
  WORKING: 0,
  FOLLOW_UP: 0,
  CONVERTED: 0,
  LOST: 0,
};

export default function LeadPipelinePage() {
  const navigate =
    useNavigate();

  const loggedInEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const [
    pipeline,
    setPipeline,
  ] =
    useState<LeadPipeline>(
      emptyPipeline
    );

  const [
    counts,
    setCounts,
  ] =
    useState<PipelineCounts>(
      emptyCounts
    );

  const [
    employees,
    setEmployees,
  ] =
    useState<any[]>([]);

  const [
    employeeId,
    setEmployeeId,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    moving,
    setMoving,
  ] = useState(false);

  const [
    draggedLead,
    setDraggedLead,
  ] =
    useState<Lead | null>(
      null
    );

  const [
    dragOverStage,
    setDragOverStage,
  ] =
    useState<
      PipelineStage | null
    >(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ============================
     EMPLOYEES
  ============================ */

  useEffect(() => {
    const loadEmployees =
      async () => {
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
        } catch (error) {
          console.error(
            "Employee Error",
            error
          );
        }
      };

    loadEmployees();
  }, []);

  /* ============================
     LOAD PIPELINE
  ============================ */

  const loadPipeline =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getLeadPipeline({
              employeeId:
                employeeId ||
                undefined,

              search:
                search ||
                undefined,
            });

          setPipeline(
            response.pipeline ||
              emptyPipeline
          );

          setCounts(
            response.counts ||
              emptyCounts
          );

          setTotal(
            response.total || 0
          );
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data?.message ||
              "Failed to load pipeline"
          );
        } finally {
          setLoading(false);
        }
      },
      [
        employeeId,
        search,
      ]
    );

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  /* ============================
     MY LEADS
  ============================ */

  const showMyPipeline =
    () => {
      if (
        !loggedInEmployee
          ?.id
      ) {
        return;
      }

      setEmployeeId(
        loggedInEmployee.id
      );
    };

  /* ============================
     DRAG
  ============================ */

  const handleDragStart = (
    lead: Lead
  ) => {
    setDraggedLead(
      lead
    );

    setSuccessMessage(
      ""
    );

    setError("");
  };

  const handleDrop =
    async (
      stage:
        PipelineStage
    ) => {
      setDragOverStage(
        null
      );

      if (
        !draggedLead ||
        draggedLead.stage ===
          stage
      ) {
        setDraggedLead(
          null
        );

        return;
      }

      try {
        setMoving(true);
        setError("");

        await changeLeadStage(
          draggedLead.id,
          {
            stage,

            remarks:
              `Pipeline moved from ${draggedLead.stage} to ${stage}`,
          }
        );

        setSuccessMessage(
          `${draggedLead.name || draggedLead.leadCode} moved to ${formatStage(
            stage
          )}`
        );

        await loadPipeline();
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to move lead"
        );
      } finally {
        setMoving(false);

        setDraggedLead(
          null
        );
      }
    };

  return (
    <div className="space-y-5">
      {/* =====================
          HEADER
      ===================== */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lead Pipeline
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Visual sales pipeline
            • {total} leads
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              showMyPipeline
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <UserRound
              size={16}
            />

            My Pipeline
          </button>

          <button
            type="button"
            onClick={
              loadPipeline
            }
            disabled={
              moving
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* =====================
          FILTERS
      ===================== */}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_280px]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search pipeline..."
            className={`${inputClass} pl-9`}
          />
        </div>

        <select
          value={
            employeeId
          }
          onChange={(e) =>
            setEmployeeId(
              e.target.value
            )
          }
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

      {/* Messages */}

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

      {/* =====================
          PIPELINE
      ===================== */}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-14 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading pipeline...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3">
          <div className="grid min-w-362.5 grid-cols-5 gap-4">
            {stages.map(
              (stage) => (
                <PipelineColumn
                
                  label={
                    stage.label
                  }
                  description={
                    stage.description
                  }
                  count={
                    counts[
                      stage.key
                    ]
                  }
                  leads={
                    pipeline[
                      stage.key
                    ]
                  }
                  active={
                    dragOverStage ===
                    stage.key
                  }
                  moving={
                    moving
                  }
                  onDragEnter={() =>
                    setDragOverStage(
                      stage.key
                    )
                  }
                  onDragLeave={() =>
                    setDragOverStage(
                      null
                    )
                  }
                  onDrop={() =>
                    handleDrop(
                      stage.key
                    )
                  }
                  onDragStart={
                    handleDragStart
                  }
                  onView={(
                    leadId
                  ) =>
                    navigate(
                      `/leads/${leadId}`
                    )
                  }
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================
   PIPELINE COLUMN
============================ */

function PipelineColumn({
  
  label,
  description,
  count,
  leads,
  active,
  moving,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragStart,
  onView,
}: {

  label: string;

  description: string;

  count: number;

  leads: Lead[];

  active: boolean;

  moving: boolean;

  onDragEnter: () => void;

  onDragLeave: () => void;

  onDrop: () => void;

  onDragStart: (
    lead: Lead
  ) => void;

  onView: (
    leadId: string
  ) => void;
}) {
  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();

        onDragEnter();
      }}
      onDragLeave={
        onDragLeave
      }
      onDrop={(e) => {
        e.preventDefault();

        onDrop();
      }}
      className={`min-h-150 rounded-xl border transition ${
        active
          ? "border-blue-400 bg-blue-50/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      {/* Header */}

      <div className="sticky top-0 z-10 rounded-t-xl border-b border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">
              {label}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {description}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {count}
          </span>
        </div>
      </div>

      {/* Cards */}

      <div className="space-y-3 p-3">
        {leads.map(
          (lead) => (
            <LeadCard
              key={
                lead.id
              }
              lead={lead}
              disabled={
                moving
              }
              onDragStart={() =>
                onDragStart(
                  lead
                )
              }
              onView={() =>
                onView(
                  lead.id
                )
              }
            />
          )
        )}

        {leads.length ===
          0 && (
          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
            <Users
              size={24}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-xs text-slate-400">
              Drop lead here
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ============================
   LEAD CARD
============================ */

function LeadCard({
  lead,
  disabled,
  onDragStart,
  onView,
}: {
  lead: Lead;

  disabled: boolean;

  onDragStart: () => void;

  onView: () => void;
}) {
  return (
    <article
      draggable={
        !disabled
      }
      onDragStart={
        onDragStart
      }
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow ${
        disabled
          ? "cursor-wait opacity-60"
          : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical
          size={17}
          className="mt-0.5 shrink-0 text-slate-300"
        />

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={
              onView
            }
            className="max-w-full text-left"
          >
            <p className="truncate text-sm font-semibold text-slate-900 hover:text-blue-700">
              {lead.name ||
                "Unnamed Lead"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              {
                lead.leadCode
              }
            </p>
          </button>
        </div>
      </div>

      {/* Status */}

      <div className="mt-3">
        <StatusBadge
          name={
            lead.status?.name ||
            "-"
          }
          color={
            lead.status?.color
          }
        />
      </div>

      <div className="mt-2">
  <LeadAgingBadge
    aging={
      lead.aging
    }
  />
</div>

      {/* Contact */}

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Phone
            size={13}
          />

          {lead.mobile}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <UserRound
            size={13}
          />

          {lead
            .assignedEmployee
            ?.name ||
            "Unassigned"}
        </div>

        {lead.nextFollowUp && (
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <CalendarClock
              size={13}
            />

            {formatDateTime(
              lead.nextFollowUp
            )}
          </div>
        )}
      </div>

      {/* Actions */}

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
        <a
          href={`tel:${lead.mobile}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <Phone
            size={13}
          />

          Call
        </a>

        <button
          type="button"
          onClick={
            onView
          }
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <Eye
            size={13}
          />

          View
        </button>
      </div>
    </article>
  );
}

/* ============================
   HELPERS
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

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

function formatDateTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatStage(
  value: string
) {
  return value
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