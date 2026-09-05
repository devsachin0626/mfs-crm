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
  useSearchParams
} from "react-router-dom";

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
  getCallingQueue,
  getDailyCallingSummary,
  saveCallOutcome,
} from "../../services/calling.service";

import {
  getLeadStatuses,
} from "../../services/leadStatus.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import LeadAgingBadge from "../../features/lead/LeadAgingBadge";

import type {
  CallOutcome,
  CallingQueueLead,
  CallingQueueType,
  DailyCallingSummary,
} from "../../types/calling.types";

/* ============================
   OUTCOME OPTIONS
============================ */

const outcomeOptions: Array<{
  value: CallOutcome;
  label: string;
  description: string;
}> = [
  {
    value: "CONNECTED",
    label: "Connected",
    description:
      "Customer answered the call",
  },

  {
    value: "NO_ANSWER",
    label: "No Answer",
    description:
      "Call was not answered",
  },

  {
    value: "BUSY",
    label: "Busy",
    description:
      "Customer line was busy",
  },

  {
    value: "CALL_BACK",
    label: "Call Back",
    description:
      "Customer requested another call",
  },

  {
    value: "INTERESTED",
    label: "Interested",
    description:
      "Customer showed interest",
  },

  {
    value: "DEMO",
    label: "Demo",
    description:
      "Demo or detailed discussion",
  },

  {
    value:
      "NOT_INTERESTED",
    label:
      "Not Interested",
    description:
      "Lead will be marked Lost",
  },

  {
    value:
      "WRONG_NUMBER",
    label:
      "Wrong Number",
    description:
      "Lead will be marked Lost",
  },
];

/* ============================
   STATUS TYPE
============================ */

interface LeadStatusOption {
  id: string;

  name: string;

  color?: string | null;
}

/* ============================
   PAGE
============================ */

export default function CallingWorkspacePage() {
  const navigate =
    useNavigate();


const [
  searchParams,
] =
  useSearchParams();

const requestedLeadId =
  searchParams.get(
    "leadId"
  );

  const loggedInEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const [
    callingSummary,
    setCallingSummary,
  ] =
    useState<DailyCallingSummary | null>(
      null
    );

  const [
    queue,
    setQueue,
  ] =
    useState<CallingQueueLead[]>(
      []
    );

  const [
    statuses,
    setStatuses,
  ] =
    useState<LeadStatusOption[]>(
      []
    );

  const [
    selectedIndex,
    setSelectedIndex,
  ] =
    useState(0);

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    totalPages,
    setTotalPages,
  ] =
    useState(1);

  const [
    total,
    setTotal,
  ] =
    useState(0);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [
    callOutcome,
    setCallOutcome,
  ] =
    useState<CallOutcome | "">(
      ""
    );

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState("");

  const [
    remarks,
    setRemarks,
  ] =
    useState("");

  const [
    followUpDate,
    setFollowUpDate,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

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

  const selectedLead =
    queue[
      selectedIndex
    ] || null;

  /* ============================
     RULES
  ============================ */

  const requiresFollowUp =
    callOutcome ===
      "CALL_BACK" ||
    callOutcome ===
      "INTERESTED";

  const marksLeadLost =
    callOutcome ===
      "NOT_INTERESTED" ||
    callOutcome ===
      "WRONG_NUMBER";

  /* ============================
     CALL SUMMARY
  ============================ */

  const loadCallingSummary =
    useCallback(
      async () => {
        if (
          !loggedInEmployee?.id
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
  }, [
    loadCallingSummary,
  ]);

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
        } catch (
          error
        ) {
          console.error(
            "Lead status load error",
            error
          );
        }
      };

    loadStatuses();
  }, []);

  /* ============================
     SEARCH DEBOUNCE
  ============================ */

  useEffect(() => {
    const timer =
      setTimeout(
        () => {
          setPage(
            1
          );

          setSearch(
            searchInput.trim()
          );
        },
        400
      );

    return () =>
      clearTimeout(
        timer
      );
  }, [
    searchInput,
  ]);

  /* ============================
     LOAD CALLING QUEUE
  ============================ */

  const loadQueue =
    useCallback(
      async (
        resetSelection =
          true
      ) => {
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
            await getCallingQueue({
              page,

              limit: 20,

              search:
                search ||
                undefined,

              /*
               * Employee ID optional hai,
               * backend access check karega.
               */
              employeeId:
                loggedInEmployee.id,
            });

          setQueue(
            response.queue ||
              []
          );

          const queueItems =
  response.queue ||
  [];

setQueue(
  queueItems
);

setTotal(
  response.total ||
    0
);

setTotalPages(
  response.totalPages ||
    1
);

if (
  requestedLeadId
) {
  const requestedIndex =
    queueItems.findIndex(
      (
        lead
      ) =>
        lead.id ===
        requestedLeadId
    );

  if (
    requestedIndex >=
    0
  ) {
    setSelectedIndex(
      requestedIndex
    );

    return;
  }
}

if (
  resetSelection
) {
  setSelectedIndex(
    0
  );
} else {
  setSelectedIndex(
    (
      current
    ) => {
      const maxIndex =
        Math.max(
          queueItems.length -
            1,
          0
        );

      return Math.min(
        current,
        maxIndex
      );
    }
  );
}

          setTotal(
            response.total ||
              0
          );

          setTotalPages(
            response.totalPages ||
              1
          );

          if (
            resetSelection
          ) {
            setSelectedIndex(
              0
            );
          } else {
            setSelectedIndex(
              (
                current
              ) => {
                const maxIndex =
                  Math.max(
                    (
                      response.queue
                        ?.length ||
                      1
                    ) - 1,
                    0
                  );

                return Math.min(
                  current,
                  maxIndex
                );
              }
            );
          }
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data
              ?.message ||
            "Failed to load calling queue"
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
      ]
    );

  useEffect(() => {
    loadQueue();
  }, [
    loadQueue,
  ]);

  /* ============================
     RESET FORM
  ============================ */

  useEffect(() => {
    setCallOutcome(
      ""
    );

    setSelectedStatus(
      ""
    );

    setRemarks(
      ""
    );

    setFollowUpDate(
      ""
    );

    setError(
      ""
    );

    setSuccessMessage(
      ""
    );
  }, [
    selectedLead?.id,
  ]);

  /* ============================
     SAVE CALL
  ============================ */

  const handleSaveUpdate =
    async () => {
      if (
        !selectedLead ||
        !loggedInEmployee?.id
      ) {
        return;
      }

      if (
        !callOutcome
      ) {
        setError(
          "Please select call outcome"
        );

        return;
      }

      if (
        requiresFollowUp &&
        !followUpDate
      ) {
        setError(
          "Follow-up date is required for Call Back or Interested outcome"
        );

        return;
      }

      if (
        followUpDate
      ) {
        const selectedDate =
          new Date(
            followUpDate
          );

        if (
          Number.isNaN(
            selectedDate.getTime()
          )
        ) {
          setError(
            "Invalid follow-up date"
          );

          return;
        }

        if (
          selectedDate <=
          new Date()
        ) {
          setError(
            "Follow-up date must be in the future"
          );

          return;
        }
      }

      try {
        setSaving(
          true
        );

        setError(
          ""
        );

        setSuccessMessage(
          ""
        );

        const currentLeadId =
          selectedLead.id;

        const currentIndex =
          selectedIndex;

        const response =
          await saveCallOutcome(
            currentLeadId,
            {
              outcome:
                callOutcome,

              statusId:
                selectedStatus ||
                undefined,

              remarks:
                remarks.trim() ||
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

        /* ============================
           REMOVE CURRENT FROM QUEUE

           Calling queue actionable
           workflow hai. Call save hone
           ke baad current lead ko
           current page queue se remove
           karenge.
        ============================ */

        setQueue(
          (
            currentQueue
          ) =>
            currentQueue.filter(
              (
                lead
              ) =>
                lead.id !==
                currentLeadId
            )
        );

        setTotal(
          (
            current
          ) =>
            Math.max(
              current - 1,
              0
            )
        );

        setSuccessMessage(
          response?.message ||
            "Call saved successfully"
        );

        /* ============================
           KEEP NEXT LEAD SELECTED
        ============================ */

        setSelectedIndex(
          (
          
          ) => {
            const nextLength =
              Math.max(
                queue.length -
                  1,
                0
              );

            if (
              nextLength ===
              0
            ) {
              return 0;
            }

            if (
              currentIndex <
              nextLength
            ) {
              return currentIndex;
            }

            return Math.max(
              nextLength -
                1,
              0
            );
          }
        );

        /*
         * Form immediately clear.
         * selectedLead ID may remain
         * same index after removal.
         */

        setCallOutcome(
          ""
        );

        setSelectedStatus(
          ""
        );

        setRemarks(
          ""
        );

        setFollowUpDate(
          ""
        );

        /* ============================
           REFILL PAGE

           Queue me few records bachne
           par backend se latest priority
           queue fetch karenge.
        ============================ */

        if (
          queue.length <=
          5
        ) {
          await loadQueue(
            false
          );
        }

        /*
         * Lost lead backend already
         * LOST mark karega.
         */

        if (
          marksLeadLost
        ) {
          return;
        }
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Failed to save call"
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================
     NAVIGATION
  ============================ */

  const previousLead =
    () => {
      setSelectedIndex(
        (
          current
        ) =>
          Math.max(
            current - 1,
            0
          )
      );
    };

  const nextLead =
    () => {
      setSelectedIndex(
        (
          current
        ) =>
          Math.min(
            current + 1,
            queue.length - 1
          )
      );
    };

  /* ============================
     QUEUE SUMMARY
  ============================ */

  const queueSummary =
    useMemo(() => {
      return {
        overdue:
          queue.filter(
            (
              lead
            ) =>
              lead.queueType ===
              "OVERDUE"
          ).length,

        today:
          queue.filter(
            (
              lead
            ) =>
              lead.queueType ===
              "TODAY"
          ).length,

        newLeads:
          queue.filter(
            (
              lead
            ) =>
              lead.queueType ===
              "NEW"
          ).length,

        general:
          queue.filter(
            (
              lead
            ) =>
              lead.queueType ===
              "GENERAL"
          ).length,
      };
    }, [
      queue,
    ]);

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
            Calling Workspace
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Priority based calling queue
          </p>
        </div>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={() => {
            loadQueue();
            loadCallingSummary();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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

      {/* ============================
          DAILY SUMMARY
      ============================ */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Calls Today"
          value={
            callingSummary
              ?.summary
              .todayCalls ??
            0
          }
          subText={`Target ${
            callingSummary
              ?.summary
              .dailyTarget ??
            250
          }`}
        />

        <SummaryCard
          title="Remaining Calls"
          value={
            callingSummary
              ?.summary
              .remaining ??
            250
          }
          subText="Today's target"
        />

        <SummaryCard
          title="Calling Queue"
          value={
            total
          }
          subText="Actionable leads"
        />

        <SummaryCard
          title="Overdue"
          value={
            queueSummary.overdue
          }
          subText="Highest priority"
        />
      </div>

      {/* ============================
          TARGET PROGRESS
      ============================ */}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Daily Calling Target
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {callingSummary
                ?.summary
                .todayCalls ??
                0}
              {" / "}
              {callingSummary
                ?.summary
                .dailyTarget ??
                250}
              {" calls"}
            </p>
          </div>

          <p className="text-lg font-bold text-blue-700">
            {callingSummary
              ?.summary
              .achievementPercent ??
              0}
            %
          </p>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${Math.min(
                callingSummary
                  ?.summary
                  .achievementPercent ??
                  0,
                100
              )}%`,
            }}
          />
        </div>
      </section>

      {/* ============================
          TODAY'S OUTCOMES
      ============================ */}

      {callingSummary && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">
            Today's Call Outcomes
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {outcomeOptions.map(
              (option) => (
                <MiniCard
                  key={
                    option.value
                  }
                  label={
                    option.label
                  }
                  value={
                    callingSummary
                      .summary
                      .outcomes[
                      option.value
                    ] ?? 0
                  }
                />
              )
            )}
          </div>
        </section>
      )}

      {/* ============================
          QUEUE TYPES
      ============================ */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QueueStat
          title="Overdue"
          value={
            queueSummary.overdue
          }
          type="OVERDUE"
        />

        <QueueStat
          title="Today"
          value={
            queueSummary.today
          }
          type="TODAY"
        />

        <QueueStat
          title="New"
          value={
            queueSummary.newLeads
          }
          type="NEW"
        />

        <QueueStat
          title="General"
          value={
            queueSummary.general
          }
          type="GENERAL"
        />
      </div>

      {/* ============================
          SEARCH
      ============================ */}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
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
                e.target
                  .value
              )
            }
            placeholder="Search calling queue..."
            className={`${inputClass} pl-9`}
          />
        </div>
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
          MAIN
      ============================ */}

      {loading ? (
        <LoadingState />
      ) : !selectedLead ? (
        <EmptyState
          page={
            page
          }
          totalPages={
            totalPages
          }
          onPreviousPage={() =>
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
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ============================
              LEFT
          ============================ */}

          <div className="space-y-5">
            {/* LEAD */}

            <section className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-6">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
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

                        <QueueBadge
                          type={
                            selectedLead.queueType
                          }
                        />

                        <StageBadge
                          stage={
                            selectedLead.stage
                          }
                        />

                        {selectedLead.aging && (
                          <LeadAgingBadge
                            aging={
                              selectedLead.aging
                            }
                          />
                        )}
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

              {/* CONTACT */}

              <div className="grid gap-4 p-6 md:grid-cols-2">
                <ContactRow
                  icon={
                    <Phone
                      size={17}
                    />
                  }
                  label="Mobile"
                  value={
                    selectedLead.mobile ||
                    "-"
                  }
                />

                <ContactRow
                  icon={
                    <Mail
                      size={17}
                    />
                  }
                  label="Email"
                  value={
                    selectedLead.email ||
                    "-"
                  }
                />

                <ContactRow
                  icon={
                    <MapPin
                      size={17}
                    />
                  }
                  label="City"
                  value={
                    selectedLead.city ||
                    "-"
                  }
                />

                <ContactRow
                  icon={
                    <Clock3
                      size={17}
                    />
                  }
                  label="Next Follow-up"
                  value={
                    selectedLead.nextFollowUp
                      ? formatDateTime(
                          selectedLead.nextFollowUp
                        )
                      : "Not scheduled"
                  }
                />

                <ContactRow
                  icon={
                    <UserRound
                      size={17}
                    />
                  }
                  label="Assigned Employee"
                  value={
                    selectedLead
                      .assignedEmployee
                      ?.name ||
                    "-"
                  }
                />

                <ContactRow
                  icon={
                    <CalendarClock
                      size={17}
                    />
                  }
                  label="Last Call"
                  value={
                    selectedLead.lastCallAt
                      ? formatDateTime(
                          selectedLead.lastCallAt
                        )
                      : "Never called"
                  }
                />
              </div>
            </section>

            {/* QUEUE NAVIGATION */}

            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Calling Queue
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Lead{" "}
                    {selectedIndex +
                      1}
                    {" of "}
                    {
                      queue.length
                    }
                    {" • Page "}
                    {page}
                    {" of "}
                    {totalPages}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={
                      selectedIndex ===
                      0
                    }
                    onClick={
                      previousLead
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      selectedIndex >=
                      queue.length -
                        1
                    }
                    onClick={
                      nextLead
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    Next

                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>
              </div>

              {/* PAGE NAVIGATION */}

              {totalPages >
                1 && (
                <div className="mt-4 flex justify-between border-t border-slate-100 pt-4">
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
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium disabled:opacity-40"
                  >
                    Previous Page
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
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium disabled:opacity-40"
                  >
                    Next Page
                  </button>
                </div>
              )}
            </section>

          </div>

          {/* ============================
              RIGHT
          ============================ */}

          <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-5">
            <div>
              <h3 className="font-semibold text-slate-900">
                Save Call Update
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Save outcome and move to next priority lead
              </p>
            </div>

            {/* OUTCOME */}

            <div className="mt-5">
              <FieldLabel
                required
              >
                Call Outcome
              </FieldLabel>

              <select
                value={
                  callOutcome
                }
                onChange={(event) =>
                  setCallOutcome(
                    event.target.value as CallOutcome | ""
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Select call outcome
                </option>

                {outcomeOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
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

              {callOutcome && (
                <p className="mt-1.5 text-xs text-slate-500">
                  {
                    outcomeOptions.find(
                      (option) =>
                        option.value === callOutcome
                    )?.description
                  }
                </p>
              )}
            </div>

            {/* LOST WARNING */}

            {marksLeadLost && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                This outcome will mark the lead as Lost and remove it from the calling queue.
              </div>
            )}

            {/* STATUS */}

            <div className="mt-5">
              <FieldLabel>
                Lead Status
              </FieldLabel>

              <select
                value={
                  selectedStatus
                }
                onChange={(
                  e
                ) =>
                  setSelectedStatus(
                    e.target
                      .value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Keep current status
                </option>

                {statuses.map(
                  (
                    status
                  ) => (
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
            </div>

            {/* FOLLOW-UP */}

            <div className="mt-5">
              <FieldLabel
                required={
                  requiresFollowUp
                }
              >
                Follow-up Date
              </FieldLabel>

              <div className="relative">
                <CalendarClock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="datetime-local"
                  value={
                    followUpDate
                  }
                  min={
                    getMinDateTime()
                  }
                  onChange={(
                    e
                  ) =>
                    setFollowUpDate(
                      e.target
                        .value
                    )
                  }
                  className={`${inputClass} pl-9`}
                />
              </div>

              {requiresFollowUp && (
                <p className="mt-1.5 text-xs text-blue-600">
                  Follow-up is mandatory for this outcome.
                </p>
              )}
            </div>

            {/* REMARKS */}

            <div className="mt-5">
              <FieldLabel>
                Remarks
              </FieldLabel>

              <textarea
                rows={4}
                value={
                  remarks
                }
                onChange={(
                  e
                ) =>
                  setRemarks(
                    e.target
                      .value
                  )
                }
                placeholder="Enter call notes..."
                className={
                  inputClass
                }
              />
            </div>

            {/* SAVE */}

            <button
              type="button"
              disabled={
                saving ||
                !callOutcome ||
                (
                  requiresFollowUp &&
                  !followUpDate
                )
              }
              onClick={
                handleSaveUpdate
              }
              className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Call..."
                : "Save & Next Lead"}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ============================
   SUMMARY CARD
============================ */

function SummaryCard({
  title,
  value,
  subText,
}: {
  title: string;

  value:
    | number
    | string;

  subText: string;
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
        {subText}
      </p>
    </div>
  );
}

/* ============================
   QUEUE STAT
============================ */

function QueueStat({
  title,
  value,
  type,
}: {
  title: string;

  value: number;

  type: CallingQueueType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <QueueBadge
          type={
            type
          }
        />
      </div>
    </div>
  );
}

/* ============================
   QUEUE BADGE
============================ */

function QueueBadge({
  type,
}: {
  type: CallingQueueType;
}) {
  const classes: Record<
    CallingQueueType,
    string
  > = {
    OVERDUE:
      "bg-red-50 text-red-700",

    TODAY:
      "bg-amber-50 text-amber-700",

    NEW:
      "bg-blue-50 text-blue-700",

    GENERAL:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[type]}`}
    >
      {type}
    </span>
  );
}

/* ============================
   MINI CARD
============================ */

function MiniCard({
  label,
  value,
}: {
  label: string;

  value:
    | number
    | string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================
   CONTACT
============================ */

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
      <div className="mt-0.5 text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 wrap-break-word text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================
   FIELD LABEL
============================ */

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;

  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
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
  const classes: Record<
    string,
    string
  > = {
    NEW:
      "bg-slate-100 text-slate-700",

    WORKING:
      "bg-blue-50 text-blue-700",

    FOLLOW_UP:
      "bg-amber-50 text-amber-700",

    CONVERTED:
      "bg-emerald-50 text-emerald-700",

    LOST:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        classes[
          stage
        ] ||
        "bg-slate-100 text-slate-600"
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
   LOADING
============================ */

function LoadingState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-14 text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

      <p className="mt-3 text-sm text-slate-500">
        Loading priority queue...
      </p>
    </div>
  );
}

/* ============================
   EMPTY
============================ */

function EmptyState({
  page,
  totalPages,
  onPreviousPage,
}: {
  page: number;

  totalPages: number;

  onPreviousPage: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-14 text-center">
      <UserRound
        size={40}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 font-medium text-slate-700">
        Calling queue is empty
      </p>

      <p className="mt-1 text-sm text-slate-400">
        No actionable assigned leads found on this page.
      </p>

      {page > 1 &&
        totalPages >
          0 && (
          <button
            type="button"
            onClick={
              onPreviousPage
            }
            className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Previous Page
          </button>
        )}
    </div>
  );
}

/* ============================
   HELPERS
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function getInitials(
  name?:
    | string
    | null
) {
  if (!name) {
    return "L";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]
          ?.toUpperCase()
    )
    .join("");
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

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}

function getMinDateTime() {
  const date =
    new Date();

  date.setMinutes(
    date.getMinutes() -
      date.getTimezoneOffset()
  );

  return date
    .toISOString()
    .slice(
      0,
      16
    );
}
