import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Timer,
  User,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  completeTrial,
  extendTrial,
  getTrialById,
} from "../../services/trial.service";

import {
  getTrialRuntimeSettings,
} from "../../services/settings.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  Trial,
  TrialStatus,
} from "../../types/trial.types";

/* ============================
   PAGE
============================ */

export default function TrialDetailsPage() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const [
    trial,
    setTrial,
  ] =
    useState<Trial | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    showExtend,
    setShowExtend,
  ] =
    useState(false);

  const [
    extendDays,
    setExtendDays,
  ] =
    useState("7");

  const [
    extendRemarks,
    setExtendRemarks,
  ] =
    useState("");

  /* ============================
     RUNTIME TRIAL SETTINGS
  ============================ */

  const [
    maxExtensionDays,
    setMaxExtensionDays,
  ] =
    useState(7);

  const [
    maxExtensions,
    setMaxExtensions,
  ] =
    useState(2);

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

  const canManage =
    roleName === "ADMIN" ||
    roleName === "HR" ||
    roleName ===
      "TEAM_LEADER";

  /* ============================
     LOAD
  ============================ */

  const loadTrial =
    async () => {
      if (!id) {
        setError(
          "Trial ID is missing"
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setError("");

        const [
          trialResponse,
          runtimeResponse,
        ] =
          await Promise.all([
            getTrialById(
              id
            ),

            getTrialRuntimeSettings(),
          ]);

        setTrial(
          trialResponse.trial
        );

        const runtime =
          runtimeResponse?.trial;

        if (runtime) {
          const extensionDays =
            Number(
              runtime.maxExtensionDays
            );

          const extensions =
            Number(
              runtime.maxExtensions
            );

          if (
            Number.isInteger(
              extensionDays
            ) &&
            extensionDays >= 0
          ) {
            setMaxExtensionDays(
              extensionDays
            );

            setExtendDays(
              extensionDays > 0
                ? String(
                    Math.min(
                      extensionDays,
                      7
                    )
                  )
                : "0"
            );
          }

          if (
            Number.isInteger(
              extensions
            ) &&
            extensions >= 0
          ) {
            setMaxExtensions(
              extensions
            );
          }
        }
      } catch (error: any) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to load trial"
        );

        setTrial(null);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadTrial();
  }, [id]);

  /* ============================
     EXTEND
  ============================ */

  const handleExtend =
    async () => {
      if (
        !id ||
        !trial
      ) {
        return;
      }

      const days =
        Number(
          extendDays
        );

      if (
        !Number.isInteger(
          days
        ) ||
        days <= 0
      ) {
        setError(
          "Extension days must be greater than 0"
        );

        return;
      }

      if (
        maxExtensionDays <= 0
      ) {
        setError(
          "Trial extension is disabled in Settings"
        );

        return;
      }

      if (
        days >
        maxExtensionDays
      ) {
        setError(
          `Maximum ${maxExtensionDays} days can be added per extension`
        );

        return;
      }

      if (
        trial.extensionCount >=
        maxExtensions
      ) {
        setError(
          `Maximum ${maxExtensions} trial extensions allowed`
        );

        return;
      }

      try {
        setActionLoading(
          true
        );

        setError("");

        setSuccess("");

        const response =
          await extendTrial(
            id,
            {
              trialDays:
                days,

              remarks:
                extendRemarks
                  .trim() ||
                undefined,
            }
          );

        setTrial(
          response.trial
        );

        setSuccess(
          response.message ||
            "Trial extended successfully"
        );

        setShowExtend(
          false
        );

        setExtendRemarks(
          ""
        );

        setExtendDays(
          maxExtensionDays > 0
            ? String(
                Math.min(
                  maxExtensionDays,
                  7
                )
              )
            : "0"
        );
      } catch (error: any) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to extend trial"
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* ============================
     COMPLETE
  ============================ */

  const handleComplete =
    async () => {
      if (
        !id ||
        !trial
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Mark ${trial.trialCode} as completed?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        setError("");

        setSuccess("");

        const response =
          await completeTrial(
            id
          );

        setTrial(
          response.trial
        );

        setSuccess(
          response.message ||
            "Trial completed successfully"
        );
      } catch (error: any) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to complete trial"
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-blue-700"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading trial...
          </p>
        </div>
      </div>
    );
  }

  /* ============================
     NOT FOUND
  ============================ */

  if (!trial) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/trials"
            )
          }
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft
            size={16}
          />

          Back to Trials
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            Unable to load trial
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error ||
              "Trial not found"}
          </p>
        </div>
      </div>
    );
  }

  /* ============================
     COMPUTED
  ============================ */

  const isActive =
    trial.status ===
    "ACTIVE";

  const remainingText =
    getRemainingText(
      trial.endDate
    );

  const remainingExtensions =
    Math.max(
      maxExtensions -
        trial.extensionCount,
      0
    );

  const canExtend =
    canManage &&
    isActive &&
    maxExtensionDays > 0 &&
    remainingExtensions > 0;

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/trials"
              )
            }
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft
              size={16}
            />

            Back to Trials
          </button>

          <p className="text-sm font-medium text-slate-500">
            Demo Management
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {
                trial.trialCode
              }
            </h1>

            <StatusBadge
              status={
                trial.status
              }
            />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Lead demo details,
            product, assignment
            and duration.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void loadTrial()
            }
            disabled={
              actionLoading
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
            />

            Refresh
          </button>

          {canManage &&
            isActive && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setShowExtend(
                      true
                    )
                  }
                  disabled={
                    actionLoading ||
                    !canExtend
                  }
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {remainingExtensions <=
                  0
                    ? "Extension Limit Reached"
                    : maxExtensionDays <=
                        0
                      ? "Extension Disabled"
                      : "Extend Demo"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleComplete
                  }
                  disabled={
                    actionLoading
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2
                      size={16}
                    />
                  )}

                  Complete Demo
                </button>
              </>
            )}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* ============================
          SUMMARY
      ============================ */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Trial Days"
          value={`${trial.trialDays}`}
          subtext="Total duration"
          icon={
            <Timer
              size={20}
            />
          }
        />

        <SummaryCard
          label="Start Date"
          value={formatDate(
            trial.startDate
          )}
          subtext="Demo started"
          icon={
            <CalendarDays
              size={20}
            />
          }
        />

        <SummaryCard
          label="End Date"
          value={formatDate(
            trial.endDate
          )}
          subtext={
            isActive
              ? remainingText
              : formatStatus(
                  trial.status
                )
          }
          icon={
            <Clock3
              size={20}
            />
          }
        />

        <SummaryCard
          label="Extensions"
          value={`${trial.extensionCount} / ${maxExtensions}`}
          subtext={`${remainingExtensions} remaining`}
          icon={
            <RefreshCw
              size={20}
            />
          }
        />
      </div>

      {/* ============================
          LEAD / CLIENT + PRODUCT
      ============================ */}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* LEAD / CLIENT */}

        <DetailsCard
          title={
            trial.lead
              ? "Lead Details"
              : "Client Details"
          }
        >
          {trial.lead ? (
            <>
              <DetailRow
                label="Lead Name"
                value={
                  trial.lead
                    .name ||
                  "Unnamed Lead"
                }
              />

              <DetailRow
                label="Lead Code"
                value={
                  trial.lead
                    .leadCode
                }
              />

              <DetailRow
                label="Mobile"
                value={
                  trial.lead
                    .mobile
                }
              />

              <DetailRow
                label="Email"
                value={
                  trial.lead
                    .email ||
                  "-"
                }
              />

              <DetailRow
                label="Stage"
                value={
                  trial.lead
                    .stage
                    ? formatStatus(
                        trial.lead
                          .stage
                      )
                    : "-"
                }
              />

              <DetailRow
                label="Converted"
                value={
                  trial.lead
                    .isConverted
                    ? "Yes"
                    : "No"
                }
              />

              <DetailRow
                label="Location"
                value={
                  [
                    trial.lead
                      .city,

                    trial.lead
                      .state,
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

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/leads/${trial.lead?.id}`
                  )
                }
                className="mt-2 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                View Lead
              </button>
            </>
          ) : trial.client ? (
            <>
              <DetailRow
                label="Client Name"
                value={
                  trial.client
                    .name
                }
              />

              <DetailRow
                label="Client Code"
                value={
                  trial.client
                    .clientCode
                }
              />

              <DetailRow
                label="Mobile"
                value={
                  trial.client
                    .mobile
                }
              />

              <DetailRow
                label="Email"
                value={
                  trial.client
                    .email ||
                  "-"
                }
              />

              <DetailRow
                label="Location"
                value={
                  [
                    trial.client
                      .city,

                    trial.client
                      .state,
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

              <DetailRow
                label="Active Client"
                value={
                  trial.client
                    .isActive ===
                  false
                    ? "No"
                    : "Yes"
                }
              />
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Lead / Client
              information is not
              available.
            </p>
          )}
        </DetailsCard>

        {/* PRODUCT */}

        <DetailsCard
          title="Product Details"
        >
          <DetailRow
            label="Product"
            value={
              trial.demoProduct
                ?.name ||
              trial.product
                ?.name ||
              "-"
            }
          />

          <DetailRow
            label="Product Code"
            value={
              trial.demoProduct
                ?.code ||
              trial.product
                ?.productCode ||
              "-"
            }
          />

          <DetailRow
            label="Product Source"
            value={
              trial.demoProduct
                ? "Demo Product"
                : trial.product
                  ? "Historical Product"
                  : "-"
            }
          />

          {trial.demoProduct ? (
            <>
              <DetailRow
                label="Status"
                value={
                  trial.demoProduct
                    .isActive ===
                  false
                    ? "Inactive"
                    : "Active"
                }
              />

              <DetailRow
                label="Description"
                value={
                  trial.demoProduct
                    .description ||
                  "-"
                }
              />
            </>
          ) : (
            <>
              <DetailRow
                label="Type"
                value={
                  trial.product
                    ?.type ||
                  "-"
                }
              />

              <DetailRow
                label="Standard Duration"
                value={
                  trial.product
                    ?.durationDays !=
                  null
                    ? `${trial.product.durationDays} days`
                    : "-"
                }
              />

              <DetailRow
                label="Trial Available"
                value={
                  trial.product
                    ?.isTrialAvailable
                    ? "Yes"
                    : "No"
                }
              />
            </>
          )}
        </DetailsCard>
      </div>

      {/* ============================
          ASSIGNMENT + STATUS
      ============================ */}

      <div className="grid gap-5 xl:grid-cols-2">
        <DetailsCard
          title="Assigned Employee"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <User
                size={21}
              />
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {trial.employee
                  ?.name ||
                  "Unassigned"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {trial.employee
                  ?.employeeCode ||
                  "-"}
              </p>

              {trial.employee
                ?.email && (
                <p className="mt-1 text-xs text-slate-400">
                  {
                    trial.employee
                      .email
                  }
                </p>
              )}

              {trial.employee
                ?.mobile && (
                <p className="mt-1 text-xs text-slate-400">
                  {
                    trial.employee
                      .mobile
                  }
                </p>
              )}
            </div>
          </div>
        </DetailsCard>

        <DetailsCard
          title="Trial Status"
        >
          <DetailRow
            label="Status"
            value={formatStatus(
              trial.status
            )}
          />

          <DetailRow
            label="Remaining"
            value={
              isActive
                ? remainingText
                : "-"
            }
          />

          <DetailRow
            label="Created At"
            value={formatDateTime(
              trial.createdAt
            )}
          />

          <DetailRow
            label="Updated At"
            value={formatDateTime(
              trial.updatedAt
            )}
          />
        </DetailsCard>
      </div>

      {/* ============================
          REMARKS
      ============================ */}

      <DetailsCard
        title="Remarks"
      >
        <div className="min-h-24 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {trial.remarks ||
            "No remarks added."}
        </div>
      </DetailsCard>

      {/* EMPLOYEE INFO */}

      {!canManage &&
        isActive && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">
              Demo Management
            </p>

            <p className="mt-1 text-xs text-blue-600">
              You can view your
              trial details. Trial
              extension and
              completion are
              management actions.
            </p>
          </div>
        )}

      {/* ============================
          EXTEND MODAL
      ============================ */}

      {showExtend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Extend Demo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add extra days
                to{" "}
                {
                  trial.trialCode
                }.
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Extension Days
                </label>

                <input
                  type="number"
                  min={1}
                  max={
                    maxExtensionDays
                  }
                  value={
                    extendDays
                  }
                  onChange={(
                    event
                  ) =>
                    setExtendDays(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClass
                  }
                />

                <p className="mt-2 text-xs text-slate-500">
                  Maximum{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      maxExtensionDays
                    }
                  </span>{" "}
                  days per
                  extension.{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      remainingExtensions
                    }
                  </span>{" "}
                  extension(s)
                  remaining.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    1,
                    3,
                    5,
                    7,
                    15,
                    30,
                  ]
                    .filter(
                      (days) =>
                        days <=
                        maxExtensionDays
                    )
                    .map(
                      (days) => (
                        <button
                          key={
                            days
                          }
                          type="button"
                          onClick={() =>
                            setExtendDays(
                              String(
                                days
                              )
                            )
                          }
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                            extendDays ===
                            String(
                              days
                            )
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {days} Days
                        </button>
                      )
                    )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Remarks
                </label>

                <textarea
                  rows={4}
                  value={
                    extendRemarks
                  }
                  onChange={(
                    event
                  ) =>
                    setExtendRemarks(
                      event.target
                        .value
                    )
                  }
                  placeholder="Reason or notes for extension..."
                  className={
                    inputClass
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setShowExtend(
                    false
                  )
                }
                disabled={
                  actionLoading
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleExtend
                }
                disabled={
                  actionLoading ||
                  !canExtend
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                Extend Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================
   DETAILS CARD
============================ */

function DetailsCard({
  title,
  children,
}: {
  title: string;

  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="space-y-4 p-5">
        {children}
      </div>
    </div>
  );
}

/* ============================
   DETAIL ROW
============================ */

function DetailRow({
  label,
  value,
}: {
  label: string;

  value:
    | string
    | number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="max-w-[65%] text-right text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* ============================
   SUMMARY CARD
============================ */

function SummaryCard({
  label,
  value,
  subtext,
  icon,
}: {
  label: string;

  value: string;

  subtext: string;

  icon:
    React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtext}
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
   STATUS BADGE
============================ */

function StatusBadge({
  status,
}: {
  status:
    TrialStatus;
}) {
  const styles:
    Record<
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
   FORMATTERS
============================ */

function formatStatus(
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

function formatDateTime(
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

  return date.toLocaleString(
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
    return "-";
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

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";