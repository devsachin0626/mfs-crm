import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";


import {
  getDailyCallingSummary,
  saveCallOutcome,
} from "../../services/calling.service";

import type {
  CallOutcome,
  DailyCallingSummary,
} from "../../types/calling.types";
import {
  useNavigate,
} from "react-router-dom";

import LeadAgingBadge from "../../features/lead/LeadAgingBadge";

import {
  useAppSelector,
} from "../../hooks/redux";



import {
  getLeads,
} from "../../services/lead.service";

import {

  getLeadStatuses,
} from "../../services/leadStatus.service";


import type {
  Lead,
} from "../../types/lead.types";

export default function CallingWorkspacePage() {

  



  const navigate = useNavigate();

  const [
  callingSummary,
  setCallingSummary,
] =
  useState<
    DailyCallingSummary | null
  >(null);

  



  const [
  callOutcome,
  setCallOutcome,
] =
  useState<CallOutcome | "">("");

  const loggedInEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

    const loadCallingSummary =
  useCallback(
    async () => {
      if (
        !loggedInEmployee
          ?.id
      ) {
        return;
      }

      try {
        const response =
          await getDailyCallingSummary(
            loggedInEmployee.id
          );

        setCallingSummary(
          response
        );
      } catch (
        error
      ) {
        console.error(
          "Calling summary error",
          error
        );
      }
    },
    [
      loggedInEmployee?.id,
    ]
  );

useEffect(() => {
  loadCallingSummary();
}, [loadCallingSummary]);

  const [
    leads,
    setLeads,
  ] = useState<Lead[]>([]);

  const [
    statuses,
    setStatuses,
  ] = useState<any[]>([]);

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    followUpDate,
    setFollowUpDate,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const selectedLead =
    leads[selectedIndex] ||
    null;

  /* ============================
     LOAD STATUSES
  ============================ */

  useEffect(() => {
    const loadStatuses =
      async () => {
        try {
          const response =
            await getLeadStatuses();

          setStatuses(
            response.leadStatuses ||
              []
          );
        } catch (error) {
          console.error(
            "Status Load Error",
            error
          );
        }
      };

    loadStatuses();
  }, []);

  /* ============================
     LOAD MY LEADS
  ============================ */

  const loadLeads =
    useCallback(
      async () => {
        if (
          !loggedInEmployee?.id
        ) {
          return;
        }

        try {
          setLoading(true);
          setError("");

          const response =
            await getLeads({
              page: 1,

              limit: 100,

              search:
                search ||
                undefined,

              employeeId:
                loggedInEmployee.id,
            });

          setLeads(
            response.leads ||
              []
          );

          setSelectedIndex(
            0
          );
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data?.message ||
              "Failed to load assigned leads"
          );
        } finally {
          setLoading(false);
        }
      },
      [
        loggedInEmployee?.id,
        search,
      ]
    );

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  /* ============================
     RESET CALL FORM
  ============================ */

  useEffect(() => {
    setSelectedStatus("");
    setRemarks("");
    setFollowUpDate("");
    setError("");
    setSuccessMessage("");
  }, [selectedIndex]);

  /* ============================
     SAVE CALL UPDATE
  ============================ */

const handleSaveUpdate =
  async () => {
    if (
      !selectedLead ||
      !loggedInEmployee?.id
    ) {
      return;
    }

    if (!callOutcome) {
      setError(
        "Please select call outcome"
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const currentLeadId =
        selectedLead.id;

      const currentIndex =
        selectedIndex;

      await saveCallOutcome(
        selectedLead.id,
        {
          outcome:
            callOutcome,

          statusId:
            selectedStatus ||
            undefined,

          remarks:
            remarks ||
            undefined,

          followUpDate:
            followUpDate
              ? new Date(
                  followUpDate
                ).toISOString()
              : undefined,
        }
      );

      await loadCallingSummary();

      setSuccessMessage(
        "Call saved. Moving to next lead..."
      );

      setCallOutcome("");
      setSelectedStatus("");
      setRemarks("");
      setFollowUpDate("");

      const response =
        await getLeads({
          page: 1,

          limit: 100,

          search:
            search ||
            undefined,

          employeeId:
            loggedInEmployee.id,
        });

      const updatedLeads =
        response.leads || [];

      setLeads(
        updatedLeads
      );

      if (
        updatedLeads.length ===
        0
      ) {
        setSelectedIndex(
          0
        );

        return;
      }

      const refreshedIndex =
        updatedLeads.findIndex(
          (item) =>
            item.id ===
            currentLeadId
        );

      if (
        refreshedIndex >= 0 &&
        refreshedIndex <
          updatedLeads.length -
            1
      ) {
        setSelectedIndex(
          refreshedIndex + 1
        );

        return;
      }

      if (
        currentIndex <
        updatedLeads.length
      ) {
        setSelectedIndex(
          currentIndex
        );

        return;
      }

      setSelectedIndex(
        updatedLeads.length -
          1
      );
    } catch (
      error: any
    ) {
      setError(
        error?.response?.data
          ?.message ||
          "Failed to save call"
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================
     PREVIOUS / NEXT
  ============================ */

  const previousLead =
    () => {
      if (
        selectedIndex > 0
      ) {
        setSelectedIndex(
          selectedIndex - 1
        );
      }
    };

  const nextLead =
    () => {
      if (
        selectedIndex <
        leads.length - 1
      ) {
        setSelectedIndex(
          selectedIndex + 1
        );
      }
    };

  /* ============================
     SUMMARY
  ============================ */

  const summary =
    useMemo(() => {
      return {
        total:
          leads.length,

        newLeads:
          leads.filter(
            (lead) =>
              lead.stage ===
              "NEW"
          ).length,

        followUps:
          leads.filter(
            (lead) =>
              Boolean(
                lead.nextFollowUp
              )
          ).length,
      };
    }, [leads]);

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
      {/* ======================
          HEADER
      ====================== */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Calling Workspace
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Call and update your assigned leads
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={
              loadLeads
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

      {/* ======================
          SUMMARY
      ====================== */}

     <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  <SummaryCard
    title="Calls Today"
    value={
      callingSummary?.summary.todayCalls ?? 0
    }
    subText={`Target ${
      callingSummary?.summary.dailyTarget ?? 250
    }`}
  />

  <SummaryCard
    title="Remaining Calls"
    value={
      callingSummary?.summary.remaining ?? 250
    }
    subText="Today's target"
  />

  <SummaryCard
    title="My Leads"
    value={summary.total}
    subText="Assigned leads"
  />

  <SummaryCard
    title="Follow-ups"
    value={summary.followUps}
    subText="Scheduled leads"
  />
</div>

{/* progress bar */}

<section className="rounded-xl border border-slate-200 bg-white p-5">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="text-sm font-semibold text-slate-800">
        Daily Calling Target
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {callingSummary?.summary.todayCalls ?? 0}
        {" / "}
        {callingSummary?.summary.dailyTarget ?? 250}
        {" calls"}
      </p>
    </div>

    <p className="text-lg font-bold text-blue-700">
      {callingSummary?.summary.achievementPercent ?? 0}%
    </p>
  </div>

  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
    <div
      className="h-full rounded-full bg-blue-600 transition-all"
      style={{
        width: `${Math.min(
          callingSummary?.summary.achievementPercent ?? 0,
          100
        )}%`,
      }}
    />
  </div>
</section>

      {/* ======================
          SEARCH
      ====================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
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
            placeholder="Search my leads..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ======================
          MAIN
      ====================== */}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-14 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading leads...
          </p>
        </div>
      ) : !selectedLead ? (
        <div className="rounded-xl border border-slate-200 bg-white p-14 text-center">
          <UserRound
            size={40}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 font-medium text-slate-700">
            No assigned leads found
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Assigned leads will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          {/* ======================
              LEAD PROFILE
          ====================== */}

          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white">
              {/* Lead Header */}

              <div className="border-b border-slate-100 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                      {getInitials(
                        selectedLead.name
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
  <h2 className="text-xl font-bold text-slate-900">
    {selectedLead.name ||
      "Unnamed Lead"}
  </h2>

  <StageBadge
    stage={
      selectedLead.stage
    }
  />

  <LeadAgingBadge
    aging={
      selectedLead.aging
    }
  />
</div>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          selectedLead.leadCode
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/leads/${selectedLead.id}`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Eye
                      size={15}
                    />

                    Full Details
                  </button>
                </div>
              </div>

              {/* Contact */}

              <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  icon={
                    <Phone
                      size={16}
                    />
                  }
                  label="Mobile"
                  value={
                    selectedLead.mobile
                  }
                />

                <InfoItem
                  icon={
                    <Mail
                      size={16}
                    />
                  }
                  label="Email"
                  value={
                    selectedLead.email ||
                    "-"
                  }
                />

                <InfoItem
                  icon={
                    <MapPin
                      size={16}
                    />
                  }
                  label="Location"
                  value={
                    [
                      selectedLead.city,
                      selectedLead.state,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      ) ||
                    "-"
                  }
                />

                <InfoItem
                  icon={
                    <UserRound
                      size={16}
                    />
                  }
                  label="Status"
                  value={
                    selectedLead.status
                      ?.name ||
                    "-"
                  }
                />

                <InfoItem
                  icon={
                    <Clock3
                      size={16}
                    />
                  }
                  label="Last Call"
                  value={
                    selectedLead.lastCallAt
                      ? formatDateTime(
                          selectedLead.lastCallAt
                        )
                      : "Never"
                  }
                />

                <InfoItem
                  icon={
                    <CalendarClock
                      size={16}
                    />
                  }
                  label="Next Follow-up"
                  value={
                    selectedLead.nextFollowUp
                      ? formatDateTime(
                          selectedLead.nextFollowUp
                        )
                      : "Not Scheduled"
                  }
                />
              </div>
            </section>

            {/* Big Call Button */}

            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-medium text-slate-500">
                Ready to call
              </p>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={`tel:${selectedLead.mobile}`}
                  className="inline-flex flex-1 items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white hover:bg-emerald-700"
                >
                  <Phone
                    size={20}
                  />

                  Call{" "}
                  {
                    selectedLead.mobile
                  }
                </a>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/leads/${selectedLead.id}`
                    )
                  }
                  className="rounded-xl border border-slate-200 px-5 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View Lead
                </button>
              </div>
            </section>

            {/* Lead Navigation */}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <button
                type="button"
                onClick={
                  previousLead
                }
                disabled={
                  selectedIndex ===
                  0
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft
                  size={17}
                />

                Previous
              </button>

              <p className="text-sm text-slate-500">
                Lead{" "}
                {selectedIndex +
                  1}{" "}
                of{" "}
                {leads.length}
              </p>

              <button
                type="button"
                onClick={
                  nextLead
                }
                disabled={
                  selectedIndex >=
                  leads.length -
                    1
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Next

                <ChevronRight
                  size={17}
                />
              </button>
            </div>
          </div>

          {/* ======================
              CALL UPDATE PANEL
          ====================== */}

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 xl:sticky xl:top-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Call Update
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Save call result and next action
              </p>
            </div>

            <Field
  label="Call Outcome"
  required
>
  <select
    value={callOutcome}
    onChange={(e) =>
      setCallOutcome(
        e.target.value as
          | CallOutcome
          | ""
      )
    }
    className={inputClass}
  >
    <option value="">
      Select Outcome
    </option>

    <option value="CONNECTED">
      Connected
    </option>

    <option value="NO_ANSWER">
      No Answer
    </option>

    <option value="BUSY">
      Busy
    </option>

    <option value="DEMO">
  Demo
</option>

    <option value="CALL_BACK">
      Call Back
    </option>

    <option value="INTERESTED">
      Interested
    </option>

    <option value="NOT_INTERESTED">
      Not Interested
    </option>

    <option value="WRONG_NUMBER">
      Wrong Number
    </option>
  </select>
</Field>

            <div className="mt-5 space-y-4">
              {/* Status */}

              <Field
                label="Call Status"
                required
              >
                <select
                  value={
                    selectedStatus
                  }
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Select Status
                  </option>

                  {statuses.map(
                    (status) => (
                      <option
                        key={
                          status.id
                        }
                        value={
                          status.id
                        }
                      >
                        {
                          status.name
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* Remarks */}

              <Field label="Call Remarks">
                <textarea
                  rows={5}
                  value={
                    remarks
                  }
                  onChange={(e) =>
                    setRemarks(
                      e.target.value
                    )
                  }
                  placeholder="What happened on the call?"
                  className={
                    inputClass
                  }
                />
              </Field>

              {/* Follow Up */}

              <Field label="Next Follow-up">
                <input
                  type="datetime-local"
                  value={
                    followUpDate
                  }
                  onChange={(e) =>
                    setFollowUpDate(
                      e.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

             <button
  type="button"
  onClick={
    handleSaveUpdate
  }
  disabled={
    saving ||
    !callOutcome
  }
  className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
>
  {saving
    ? "Saving..."
    : "Save & Next Lead"}
</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ============================
   COMPONENTS
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

function SummaryCard({
  title,
  value,
  subText,
}: {
  title: string;
  value: number;
  subText?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      {subText && (
        <p className="mt-1 text-xs text-slate-400">
          {subText}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
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

    CONTACTED:
      "bg-cyan-50 text-cyan-700",

    INTERESTED:
      "bg-purple-50 text-purple-700",

    FOLLOW_UP:
      "bg-amber-50 text-amber-700",

    CONVERTED:
      "bg-emerald-50 text-emerald-700",

    LOST:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
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

function getInitials(
  name?: string | null
) {
  return (
    name ||
    "Lead"
  )
    .split(" ")
    .map(
      (word) =>
        word[0]
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

 