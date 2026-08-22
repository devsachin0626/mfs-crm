import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  UserRound,
  Users,
} from "lucide-react";


import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
} from "lucide-react";

import {
  convertLeadToClient,
} from "../../services/calling.service"

import {
  getLeadTimeline,
} from "../../services/leadTimeline.service";

import type {
  LeadTimelineItem,
} from "../../types/leadTimeline.types";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchLeadDetails,
} from "../../store/slices/leadDetailsSlice";

import {
  createFollowUp,
  completeFollowUp,
} from "../../services/followup.service";

import {
  getLeadStatuses,
  changeLeadStatus,
} from "../../services/leadStatus.service";

import {
  assignLead,
} from "../../services/lead.service";

import {
  getEmployees,
} from "../../services/employee.service";

export default function LeadDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const loggedInEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const {
    lead,
    loading,
    error,
  } = useAppSelector(
    (state) =>
      state.leadDetails
  );

  const [
  converting,
  setConverting,
] = useState(false);

  const [
  timeline,
  setTimeline,
] = useState<
  LeadTimelineItem[]
>([]);

const [
  timelineLoading,
  setTimelineLoading,
] = useState(false);

  const [statuses, setStatuses] =
    useState<any[]>([]);

  const [employees, setEmployees] =
    useState<any[]>([]);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [
    statusRemarks,
    setStatusRemarks,
  ] = useState("");

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState("");

  const [
  assignmentReason,
  setAssignmentReason,
] = useState("");

  const [
    followUpDate,
    setFollowUpDate,
  ] = useState("");

  const [
    remarks,
    setRemarks,
  ] = useState("");

  const [
    savingFollowUp,
    setSavingFollowUp,
  ] = useState(false);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState(false);

  const [
    assigning,
    setAssigning,
  ] = useState(false);

  const [
    completingFollowUpId,
    setCompletingFollowUpId,
  ] = useState<string | null>(
    null
  );

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const loadTimeline =
  async (
    leadId: string
  ) => {
    try {
      setTimelineLoading(true);

      const response =
        await getLeadTimeline(
          leadId
        );

      setTimeline(
        response.timeline ||
          []
      );
    } catch (error) {
      console.error(
        "Timeline Error",
        error
      );
    } finally {
      setTimelineLoading(
        false
      );
    }
  };

useEffect(() => {
  if (id) {
    dispatch(
      fetchLeadDetails(id)
    );

    loadTimeline(id);
  }
}, [dispatch, id]);

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
            "Lead Status Error",
            error
          );
        }
      };

    loadStatuses();
  }, []);

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

const refreshLead = () => {
  if (!lead?.id) return;

  dispatch(
    fetchLeadDetails(
      lead.id
    )
  );

  loadTimeline(
    lead.id
  );
};

const handleConvertLead =
  async () => {
    if (!lead) return;

    const confirmed =
      window.confirm(
        "Convert this lead to client?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setConverting(true);
      setActionError("");
      setSuccessMessage("");

      const response =
        await convertLeadToClient(
          lead.id
        );

      setSuccessMessage(
        response.message ||
          "Lead converted successfully"
      );

      refreshLead();
    } catch (
      error: any
    ) {
      setActionError(
        error?.response
          ?.data?.message ||
          "Lead conversion failed"
      );
    } finally {
      setConverting(false);
    }
  };

  const handleStatusUpdate =
    async () => {
      if (
        !lead ||
        !selectedStatus
      ) {
        return;
      }

      try {
        setUpdatingStatus(true);
        setActionError("");
        setSuccessMessage("");

        await changeLeadStatus(
          lead.id,
          {
            statusId:
              selectedStatus,

            remarks:
              statusRemarks,
          }
        );

        setSuccessMessage(
          "Lead status updated successfully"
        );

        setSelectedStatus("");
        setStatusRemarks("");

        refreshLead();
      } catch (error: any) {
        setActionError(
          error?.response?.data
            ?.message ||
            "Status update failed"
        );
      } finally {
        setUpdatingStatus(false);
      }
    };

  const handleAssignLead =
  async () => {
    if (
      !lead ||
      !selectedEmployee
    ) {
      return;
    }

    try {
      setAssigning(true);
      setActionError("");
      setSuccessMessage("");

      await assignLead(
        lead.id,
        selectedEmployee,
        assignmentReason ||
          undefined
      );

      setSuccessMessage(
        lead.assignedEmployee
          ? "Lead transferred successfully"
          : "Lead assigned successfully"
      );

      setSelectedEmployee("");
      setAssignmentReason("");

      refreshLead();
    } catch (error: any) {
      setActionError(
        error?.response?.data
          ?.message ||
          "Lead assignment failed"
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleFollowUp =
    async () => {
      if (
        !lead ||
        !followUpDate
      ) {
        setActionError(
          "Follow-up date is required"
        );

        return;
      }

      if (
        !loggedInEmployee?.id
      ) {
        setActionError(
          "Logged-in employee not found"
        );

        return;
      }

      try {
        setSavingFollowUp(true);
        setActionError("");
        setSuccessMessage("");

        await createFollowUp({
          leadId: lead.id,

          employeeId:
            loggedInEmployee.id,

          followUpDate,

          remarks:
            remarks || undefined,
        });

        setSuccessMessage(
          "Follow-up created successfully"
        );

        setFollowUpDate("");
        setRemarks("");

        refreshLead();
      } catch (error: any) {
        setActionError(
          error?.response?.data
            ?.message ||
            "Failed to create follow-up"
        );
      } finally {
        setSavingFollowUp(false);
      }
    };

  const handleCompleteFollowUp =
    async (
      followUpId: string
    ) => {
      if (!lead) return;

      try {
        setCompletingFollowUpId(
          followUpId
        );

        setActionError("");
        setSuccessMessage("");

        await completeFollowUp(
          followUpId
        );

        setSuccessMessage(
          "Follow-up completed successfully"
        );

        refreshLead();
      } catch (error: any) {
        setActionError(
          error?.response?.data
            ?.message ||
            "Failed to complete follow-up"
        );
      } finally {
        setCompletingFollowUpId(
          null
        );
      }
    };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading lead...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          Failed to load lead
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        No Lead Found
      </div>
    );
  }

  const initials =
    (lead.name ||
      "Lead")
      .split(" ")
      .map(
        (word: string) =>
          word[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate("/leads")
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Lead Details
          </h1>

          <p className="text-sm text-slate-500">
            {lead.leadCode}
          </p>
        </div>

        <button
  type="button"
  onClick={() =>
    navigate(
      `/leads/${lead.id}/edit`
    )
  }
  className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
>
  Edit Lead
</button>
{!lead.isConverted && (
  <button
    type="button"
    onClick={
      handleConvertLead
    }
    disabled={
      converting
    }
    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
  >
    {converting
      ? "Converting..."
      : "Convert to Client"}
  </button>
)}

      </div>

      {/* Messages */}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Profile */}

      <div className="grid gap-4 lg:grid-cols-[1fr_330px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-700 text-2xl font-bold text-white">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  {lead.name ||
                    "Unnamed Lead"}
                </h2>

                <StageBadge
                  stage={
                    lead.stage
                  }
                />
              </div>

              <p className="mt-1 text-sm font-medium text-blue-700">
                {lead.status?.name ||
                  "-"}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Phone size={15} />
                  {lead.mobile}
                </div>

                <div className="flex items-center gap-2">
                  <Mail size={15} />
                  {lead.email || "-"}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={15} />
                  {lead.city || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Lead Code"
              value={
                lead.leadCode
              }
            />

            <InfoItem
              label="Status"
              value={
                lead.status?.name ||
                "-"
              }
            />

            <InfoItem
              label="Stage"
              value={lead.stage}
            />

            <InfoItem
              label="Source"
              value={
                lead.source?.name ||
                "-"
              }
            />
          </div>
        </div>

        {/* Assignment */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Lead Assignment
          </h3>

          <div className="mt-5">
            <SummaryItem
              icon={
                <UserRound
                  size={18}
                />
              }
              label="Assigned To"
              value={
                lead.assignedEmployee
                  ?.name ||
                "Unassigned"
              }
            />

            <div className="mt-5">
              <select
                value={
                  selectedEmployee
                }
                onChange={(e) =>
                  setSelectedEmployee(
                    e.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select Employee
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
                      {employee.name}
                      {" - "}
                      {
                        employee.employeeCode
                      }
                    </option>
                  )
                )}
              </select>
              <textarea
  rows={3}
  value={assignmentReason}
  onChange={(e) =>
    setAssignmentReason(
      e.target.value
    )
  }
  placeholder="Assignment / transfer reason..."
  className={`${inputClass} mt-3`}
/>

              <button
                type="button"
                onClick={
                  handleAssignLead
                }
                disabled={
                  !selectedEmployee ||
                  assigning
                }
                className="mt-3 w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {assigning
                  ? "Assigning..."
                  : "Assign / Transfer Lead"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Lead Info */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">
              Lead Information
            </h3>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Name"
                value={
                  lead.name || "-"
                }
              />

              <InfoItem
                label="Mobile"
                value={
                  lead.mobile
                }
              />

              <InfoItem
                label="Email"
                value={
                  lead.email || "-"
                }
              />

              <InfoItem
                label="City"
                value={
                  lead.city || "-"
                }
              />

              <InfoItem
                label="State"
                value={
                  lead.state || "-"
                }
              />

              <InfoItem
                label="Source"
                value={
                  lead.source?.name ||
                  "-"
                }
              />
            </div>

            {lead.address && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <InfoItem
                  label="Address"
                  value={
                    lead.address
                  }
                />
              </div>
            )}

            {lead.remarks && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <InfoItem
                  label="Remarks"
                  value={
                    lead.remarks
                  }
                />
              </div>
            )}
          </section>

          {/* Follow Ups */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="font-semibold text-slate-900">
                Follow Ups
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <TableHead>
                      Date
                    </TableHead>

                    <TableHead>
                      Remarks
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      Action
                    </TableHead>
                  </tr>
                </thead>

                <tbody>
                  {lead.followUps?.map(
                    (item: any) => (
                      <tr
                        key={
                          item.id
                        }
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatDateTime(
                            item.followUpDate
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.remarks ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          {item.isCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2
                                size={13}
                              />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                              <Clock3
                                size={13}
                              />
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {!item.isCompleted ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCompleteFollowUp(
                                  item.id
                                )
                              }
                              disabled={
                                completingFollowUpId ===
                                item.id
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {completingFollowUpId ===
                              item.id
                                ? "Completing..."
                                : "Complete"}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Done
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {!lead.followUps
              ?.length && (
              <div className="p-8 text-center text-sm text-slate-500">
                No follow-ups found
              </div>
            )}
          </section>



          {/* Assignment History */}

<section className="rounded-2xl border border-slate-200 bg-white p-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-slate-900">
        Assignment History
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Lead assignment and transfer activity
      </p>
    </div>

    <Users
      size={20}
      className="text-blue-700"
    />
  </div>

  <div className="mt-6 space-y-0">
    {lead.assignmentHistory?.map(
      (item: any) => (
        <div
          key={item.id}
          className="relative pb-6 pl-7 last:pb-0"
        >
          {/* Timeline Line */}

          <div className="absolute left-1.75 top-4 h-full w-px bg-slate-200 last:hidden" />

          {/* Timeline Dot */}

          <div className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100">
            <div className="h-2 w-2 rounded-full bg-blue-700" />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            {/* Transfer */}

            <div className="flex flex-wrap items-center gap-2">
              {item.fromEmployee ? (
                <>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {
                        item
                          .fromEmployee
                          .name
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      {
                        item
                          .fromEmployee
                          .employeeCode
                      }
                    </p>
                  </div>

                  <span className="px-1 text-slate-400">
                    →
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-blue-700">
                      {
                        item
                          .toEmployee
                          .name
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      {
                        item
                          .toEmployee
                          .employeeCode
                      }
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Initially Assigned To
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-700">
                    {
                      item
                        .toEmployee
                        .name
                    }
                  </p>

                  <p className="text-xs text-slate-500">
                    {
                      item
                        .toEmployee
                        .employeeCode
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Reason */}

            {item.reason && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs font-medium text-slate-400">
                  Reason
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {item.reason}
                </p>
              </div>
            )}

            {/* Date */}

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock3 size={13} />

              {formatDateTime(
                item.createdAt
              )}
            </div>
          </div>
        </div>
      )
    )}

    {!lead.assignmentHistory
      ?.length && (
      <div className="rounded-xl bg-slate-50 p-6 text-center">
        <Users
          size={24}
          className="mx-auto text-slate-300"
        />

        <p className="mt-2 text-sm text-slate-500">
          No assignment history found.
        </p>
      </div>
    )}
  </div>
</section>

          {/* History */}
<section className="rounded-2xl border border-slate-200 bg-white p-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-slate-900">
        Lead 360° Timeline
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Complete lead activity history
      </p>
    </div>

    <Activity
      size={20}
      className="text-blue-700"
    />
  </div>

  {timelineLoading ? (
    <div className="p-8 text-center">
      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
    </div>
  ) : (
    <div className="mt-6 space-y-0">
      {timeline.map(
        (item) => (
          <TimelineItem
            key={item.id}
            item={item}
          />
        )
      )}

      {timeline.length ===
        0 && (
        <div className="rounded-xl bg-slate-50 p-8 text-center">
          <Activity
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="mt-2 text-sm text-slate-500">
            No activity found.
          </p>
        </div>
      )}
    </div>
  )}
</section>

          {/* Client */}

          {lead.client && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">
                Client Information
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Client Code"
                  value={
                    lead.client
                      .clientCode
                  }
                />

                <InfoItem
                  label="Name"
                  value={
                    lead.client
                      .name
                  }
                />

                <InfoItem
                  label="Mobile"
                  value={
                    lead.client
                      .mobile
                  }
                />

                <InfoItem
                  label="City"
                  value={
                    lead.client
                      .city ||
                    "-"
                  }
                />
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}

        <div className="space-y-6">
          {/* Status */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <RefreshCw
                size={18}
                className="text-blue-700"
              />

              <h3 className="font-semibold text-slate-900">
                Change Status
              </h3>
            </div>

            <div className="mt-5 space-y-3">
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

              <textarea
                rows={3}
                value={
                  statusRemarks
                }
                onChange={(e) =>
                  setStatusRemarks(
                    e.target.value
                  )
                }
                placeholder="Status remarks..."
                className={
                  inputClass
                }
              />

              <button
                type="button"
                onClick={
                  handleStatusUpdate
                }
                disabled={
                  !selectedStatus ||
                  updatingStatus
                }
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {updatingStatus
                  ? "Updating..."
                  : "Update Status"}
              </button>
            </div>
          </section>

          {/* Follow Up */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <CalendarClock
                size={18}
                className="text-blue-700"
              />

              <h3 className="font-semibold text-slate-900">
                Add Follow Up
              </h3>
            </div>

            <div className="mt-5 space-y-3">
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

              <textarea
                rows={4}
                value={remarks}
                onChange={(e) =>
                  setRemarks(
                    e.target.value
                  )
                }
                placeholder="Follow-up remarks..."
                className={
                  inputClass
                }
              />

              <button
                type="button"
                onClick={
                  handleFollowUp
                }
                disabled={
                  savingFollowUp ||
                  !followUpDate
                }
                className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {savingFollowUp
                  ? "Saving..."
                  : "Create Follow Up"}
              </button>
            </div>
          </section>

          {/* Quick Summary */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">
              Quick Summary
            </h3>

            <div className="mt-5 space-y-5">
              <SummaryItem
                icon={
                  <Users
                    size={18}
                  />
                }
                label="Assigned Employee"
                value={
                  lead.assignedEmployee
                    ?.name ||
                  "Unassigned"
                }
              />

              <SummaryItem
                icon={
                  <Building2
                    size={18}
                  />
                }
                label="Lead Source"
                value={
                  lead.source?.name ||
                  "-"
                }
              />

              <SummaryItem
                icon={
                  <CalendarClock
                    size={18}
                  />
                }
                label="Next Follow Up"
                value={
                  lead.nextFollowUp
                    ? formatDateTime(
                        lead.nextFollowUp
                      )
                    : "Not Scheduled"
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function InfoItem({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SummaryItem({
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
      <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
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

function formatDateTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TimelineItem({
  item,
}: {
  item: LeadTimelineItem;
}) {
  const config = {
    CALL: {
      icon: (
        <Phone size={15} />
      ),

      label: "Call",
    },

    STATUS: {
      icon: (
        <RefreshCw
          size={15}
        />
      ),

      label: "Status",
    },

    FOLLOW_UP: {
      icon: (
        <CalendarClock
          size={15}
        />
      ),

      label:
        "Follow-up",
    },

    FOLLOW_UP_COMPLETED: {
      icon: (
        <CheckCircle2
          size={15}
        />
      ),

      label:
        "Follow-up",
    },

    ASSIGNMENT: {
      icon: (
        <Users size={15} />
      ),

      label:
        "Assignment",
    },

    CONVERSION: {
      icon: (
        <BriefcaseBusiness
          size={15}
        />
      ),

      label:
        "Conversion",
    },
  }[item.type];

  return (
    <div className="relative pb-6 pl-9 last:pb-0">
      <div className="absolute left-3.75 top-7 h-full w-px bg-slate-200 last:hidden" />

      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700">
        {config.icon}
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {config.label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {item.title}
            </p>
          </div>

          <p className="text-xs text-slate-400">
            {formatDateTime(
              item.createdAt
            )}
          </p>
        </div>

        {item.description && (
          <p className="mt-3 text-sm text-slate-600">
            {
              item.description
            }
          </p>
        )}

        {item.employee && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <UserRound
              size={13}
            />

            {
              item.employee.name
            }

            <span className="text-slate-300">
              •
            </span>

            {
              item.employee
                .employeeCode
            }
          </div>
        )}

        {item.type ===
          "ASSIGNMENT" &&
          item.meta
            ?.fromEmployee &&
          item.meta
            ?.toEmployee && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs">
              <span className="font-medium text-slate-600">
                {
                  item.meta
                    .fromEmployee
                    .name
                }
              </span>

              <ArrowRight
                size={13}
                className="text-slate-400"
              />

              <span className="font-medium text-blue-700">
                {
                  item.meta
                    .toEmployee
                    .name
                }
              </span>
            </div>
          )}

        {item.type ===
          "FOLLOW_UP" &&
          item.meta
            ?.followUpDate && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700">
              <CalendarClock
                size={13}
              />

              Scheduled for{" "}
              {formatDateTime(
                item.meta
                  .followUpDate
              )}
            </div>
          )}
      </div>
    </div>
  );
}