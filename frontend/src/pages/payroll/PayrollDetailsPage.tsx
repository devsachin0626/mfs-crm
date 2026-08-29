import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  RefreshCcw,
  Umbrella,
  User,
  UserX,
  WalletCards,
} from "lucide-react";

import {
  getPayrollById,
  recalculatePayroll,
  updatePayroll,
} from "../../services/payroll.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  Payroll,
  PayrollStatus,
} from "../../types/payroll.types";

/* ============================
   STATUS CONFIG
============================ */

const statusConfig: Record<
  PayrollStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Pending",

    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  GENERATED: {
    label: "Generated",

    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  APPROVED: {
    label: "Approved",

    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  PAID: {
    label: "Paid",

    className:
      "border-green-200 bg-green-50 text-green-700",
  },
};

/* ============================
   PAGE
============================ */

export default function PayrollDetailsPage() {
  const {
    id,
  } =
    useParams<{
      id: string;
    }>();

  const navigate =
    useNavigate();

  /* ============================
     AUTH
  ============================ */

  const currentEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const roleName =
    useMemo(() => {
      const role =
        currentEmployee
          ?.role as unknown;

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
    }, [
      currentEmployee,
    ]);

  const canManagePayroll =
    roleName ===
      "ADMIN" ||
    roleName ===
      "HR";

  /* ============================
     STATE
  ============================ */

  const [
    payroll,
    setPayroll,
  ] =
    useState<Payroll | null>(
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

  /* ============================
     LOAD PAYROLL
  ============================ */

  const loadPayroll =
    async () => {
      if (!id) {
        setError(
          "Payroll ID is missing"
        );

        setLoading(
          false
        );

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
          await getPayrollById(
            id
          );

        setPayroll(
          response.payroll
        );
      } catch (
        error: any
      ) {
        setPayroll(
          null
        );

        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Failed to load payroll"
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  useEffect(() => {
    void loadPayroll();
  }, [
    id,
  ]);

  /* ============================
     RECALCULATE
  ============================ */

  const handleRecalculate =
    async () => {
      if (
        !id ||
        !payroll ||
        !canManagePayroll
      ) {
        return;
      }

      if (
        payroll.status !==
        "PENDING"
      ) {
        setError(
          "Only Pending Payroll Can Be Recalculated"
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Recalculate payroll using latest attendance, approved leave, employee salary and attendance settings?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );

        const response =
          await recalculatePayroll(
            id
          );

        setPayroll(
          response.payroll
        );

        setSuccess(
          response.message ||
            "Payroll Recalculated Successfully"
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Payroll recalculation failed"
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* ============================
     STATUS CHANGE
  ============================ */

  const changeStatus =
    async (
      status:
        PayrollStatus
    ) => {
      if (
        !id ||
        !payroll ||
        !canManagePayroll
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to change payroll status to ${status}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        setError(
          ""
        );

        setSuccess(
          ""
        );

        const response =
          await updatePayroll(
            id,
            {
              status,
            }
          );

        setPayroll(
          response.payroll
        );

        setSuccess(
          response.message ||
            `Payroll updated to ${status}`
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Payroll status update failed"
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
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

        <p className="mt-3 text-sm text-slate-500">
          Loading payroll...
        </p>
      </div>
    );
  }

  /* ============================
     ERROR
  ============================ */

  if (
    error &&
    !payroll
  ) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/payroll"
            )
          }
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft
            size={17}
          />

          Back to Payroll
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!payroll) {
    return null;
  }

  /* ============================
     VALUES
  ============================ */

  const status =
    statusConfig[
      payroll.status
    ];

  const scheduledWorkingDays =
    payroll.scheduledWorkingDays ??
    payroll.workingDays;

  const paidLeaveDays =
    Number(
      payroll.paidLeaveDays ||
        0
    );

  const unpaidLeaveDays =
    Number(
      payroll.unpaidLeaveDays ||
        0
    );

  const actualLateCount =
    payroll.actualLateCount ??
    payroll.lateDays ??
    0;

  const allowedLateCount =
    payroll.allowedLateCount ??
    3;

  const excessLateCount =
    payroll.excessLateCount ??
    Math.max(
      actualLateCount -
        allowedLateCount,
      0
    );

  const earlyGoingCount =
    payroll.earlyGoingCount ??
    0;

  const allowedEarlyGoingCount =
    payroll.allowedEarlyGoingCount ??
    1;

  return (
    <div className="space-y-6">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/payroll"
              )
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft
              size={19}
            />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                Payroll Details
              </h1>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {
                  status.label
                }
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {
                monthNames[
                  payroll.month -
                    1
                ]
              }{" "}
              {
                payroll.year
              }
            </p>

            <p className="mt-1 text-xs font-medium text-blue-600">
              Payroll cycle:
              26th → 25th
            </p>
          </div>
        </div>

        {/* ============================
            MANAGEMENT ACTIONS
        ============================ */}

        {canManagePayroll && (
          <div className="flex flex-wrap gap-3">
            {/* EDIT */}

            {payroll.status !==
              "PAID" && (
              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  navigate(
                    `/payroll/${payroll.id}/edit`
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit Adjustments
              </button>
            )}

            {/* RECALCULATE */}

            {payroll.status ===
              "PENDING" && (
              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  void handleRecalculate()
                }
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCcw
                  size={17}
                  className={
                    actionLoading
                      ? "animate-spin"
                      : ""
                  }
                />

                Recalculate
              </button>
            )}

            {/* GENERATE */}

            {payroll.status ===
              "PENDING" && (
              <ActionButton
                loading={
                  actionLoading
                }
                label="Generate Payroll"
                loadingLabel="Generating..."
                icon={
                  <FileCheck2
                    size={18}
                  />
                }
                onClick={() =>
                  void changeStatus(
                    "GENERATED"
                  )
                }
              />
            )}

            {/* APPROVE */}

            {payroll.status ===
              "GENERATED" && (
              <ActionButton
                loading={
                  actionLoading
                }
                label="Approve Payroll"
                loadingLabel="Approving..."
                icon={
                  <CheckCircle2
                    size={18}
                  />
                }
                onClick={() =>
                  void changeStatus(
                    "APPROVED"
                  )
                }
              />
            )}

            {/* PAID */}

            {payroll.status ===
              "APPROVED" && (
              <ActionButton
                loading={
                  actionLoading
                }
                label="Mark as Paid"
                loadingLabel="Processing..."
                icon={
                  <CircleDollarSign
                    size={18}
                  />
                }
                onClick={() =>
                  void changeStatus(
                    "PAID"
                  )
                }
              />
            )}

            {payroll.status ===
              "PAID" && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                <CheckCircle2
                  size={18}
                />

                Payroll Paid
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================
          VIEW ONLY INFO
      ============================ */}

      {!canManagePayroll && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">
            Payroll View Only
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Payroll generation,
            recalculation and approval
            are managed by Admin or HR.
          </p>
        </div>
      )}

      {/* ============================
          SUCCESS
      ============================ */}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* ============================
          ERROR
      ============================ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============================
          EMPLOYEE
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <User
              size={20}
            />
          }
          title="Employee Information"
          description="Payroll employee details"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Employee Name"
            value={
              payroll.employee
                ?.name ||
              "-"
            }
          />

          <InfoCard
            label="Employee Code"
            value={
              payroll.employee
                ?.employeeCode ||
              "-"
            }
          />

          <InfoCard
            label="Mobile"
            value={
              payroll.employee
                ?.mobile ||
              "-"
            }
          />

          <InfoCard
            label="Email"
            value={
              payroll.employee
                ?.email ||
              "-"
            }
          />
        </div>
      </section>

      {/* ============================
          PAYROLL PERIOD
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <CalendarDays
              size={20}
            />
          }
          title="Payroll Period"
          description="Salary cycle runs from 26th to 25th"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Payroll Month"
            value={`${
              monthNames[
                payroll.month -
                  1
              ]
            } ${
              payroll.year
            }`}
          />

          <InfoCard
            label="Period Start"
            value={
              payroll.periodStart
                ? formatDate(
                    payroll.periodStart
                  )
                : "-"
            }
          />

          <InfoCard
            label="Period End"
            value={
              payroll.periodEnd
                ? formatDate(
                    payroll.periodEnd
                  )
                : "-"
            }
          />

          <InfoCard
            label="Scheduled Working Days"
            value={String(
              scheduledWorkingDays
            )}
          />
        </div>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs leading-5 text-blue-700">
            Sunday, First Saturday
            and configured Company
            Holidays are treated as
            paid off-days and are
            excluded from scheduled
            working days.
          </p>
        </div>
      </section>

      {/* ============================
          ATTENDANCE
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <User
              size={20}
            />
          }
          title="Attendance Summary"
          description="Attendance snapshot used by payroll policy engine"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <NumberCard
            label="Working Days"
            value={
              scheduledWorkingDays
            }
          />

          <NumberCard
            label="Present"
            value={
              payroll.presentDays
            }
          />

          <NumberCard
            label="Late"
            value={
              payroll.lateDays
            }
          />

          <NumberCard
            label="Half Day"
            value={
              payroll.halfDays
            }
          />

          <NumberCard
            label="Leave"
            value={
              payroll.leaveDays
            }
          />

          <NumberCard
            label="Absent"
            value={
              payroll.absentDays
            }
          />
        </div>
      </section>

      {/* ============================
          LEAVE POLICY
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <Umbrella
              size={20}
            />
          }
          title="Leave Salary"
          description="Approved paid and unpaid leave applied to payroll"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberCard
            label="Approved Leave"
            value={
              payroll.leaveDays
            }
          />

          <NumberCard
            label="Paid Leave"
            value={
              paidLeaveDays
            }
          />

          <NumberCard
            label="Unpaid Leave"
            value={
              unpaidLeaveDays
            }
          />

          <InfoCard
            label="Paid Leave Policy"
            value="1 Leave + Carry Forward"
          />
        </div>
      </section>

      {/* ============================
          LATE POLICY
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <Clock3
              size={20}
            />
          }
          title="Late Coming Policy"
          description="Attendance timings are read from Attendance Settings"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberCard
            label="Total Late"
            value={
              actualLateCount
            }
          />

          <NumberCard
            label="Allowed Late"
            value={
              allowedLateCount
            }
          />

          <NumberCard
            label="Excess Late"
            value={
              excessLateCount
            }
          />

          <MoneyCard
            label="Late Deduction"
            value={
              payroll.lateDeduction ||
              0
            }
          />
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          Check-In classification uses
          configured Late After and
          Half Day After values from
          Attendance Settings.
        </div>
      </section>

      {/* ============================
          EARLY GOING
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <UserX
              size={20}
            />
          }
          title="Early Going"
          description="Early departure is calculated from configured Office End Time"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberCard
            label="Early Going Count"
            value={
              earlyGoingCount
            }
          />

          <NumberCard
            label="Allowed Early Going"
            value={
              allowedEarlyGoingCount
            }
          />

          <InfoCard
            label="Early Window"
            value="90 Min Before Office End"
          />

          <InfoCard
            label="Office End"
            value="Attendance Settings"
          />
        </div>
      </section>

      {/* ============================
          SALARY
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <Banknote
              size={20}
            />
          }
          title="Salary Summary"
          description="Final payroll earnings and deductions"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MoneyCard
            label="Basic Salary"
            value={
              payroll.basicSalary
            }
          />

          <MoneyCard
            label="Gross Salary"
            value={
              payroll.grossSalary
            }
          />

          <MoneyCard
            label="Incentive"
            value={
              payroll.incentive
            }
          />

          <MoneyCard
            label="Bonus"
            value={
              payroll.bonus
            }
          />

          <MoneyCard
            label="Other Deduction"
            value={
              payroll.deduction
            }
          />

          <MoneyCard
            label="Late Deduction"
            value={
              payroll.lateDeduction ||
              0
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-blue-700 p-6 text-white">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-blue-100">
                Final Net Salary
              </p>

              <p className="mt-1 text-xs text-blue-200">
                Gross + Incentive +
                Bonus - Other Deduction
                - Late Deduction
              </p>
            </div>

            <p className="text-3xl font-bold">
              ₹
              {formatMoney(
                payroll.netSalary
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ============================
          WORKFLOW
      ============================ */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <WalletCards
              size={20}
            />
          }
          title="Payroll Workflow"
          description="Current payroll processing stage"
        />

        <div className="grid gap-3 md:grid-cols-4">
          <WorkflowStep
            label="Pending"
            active={
              [
                "PENDING",
                "GENERATED",
                "APPROVED",
                "PAID",
              ].includes(
                payroll.status
              )
            }
          />

          <WorkflowStep
            label="Generated"
            active={
              [
                "GENERATED",
                "APPROVED",
                "PAID",
              ].includes(
                payroll.status
              )
            }
          />

          <WorkflowStep
            label="Approved"
            active={
              [
                "APPROVED",
                "PAID",
              ].includes(
                payroll.status
              )
            }
          />

          <WorkflowStep
            label="Paid"
            active={
              payroll.status ===
              "PAID"
            }
          />
        </div>

        {payroll.status ===
          "PENDING" &&
          canManagePayroll && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-semibold text-amber-800">
                Payroll can still be
                recalculated
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                If attendance or leave
                was corrected, use
                Recalculate before
                generating the payroll.
              </p>
            </div>
          )}

        {payroll.status ===
          "PAID" && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">
              Payroll Locked
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              Paid payroll cannot be
              modified or recalculated.
            </p>
          </div>
        )}
      </section>

      {/* ============================
          REMARKS
      ============================ */}

      {payroll.remarks && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Remarks
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {
              payroll.remarks
            }
          </p>
        </section>
      )}
    </div>
  );
}

/* ============================
   ACTION BUTTON
============================ */

function ActionButton({
  loading,
  label,
  loadingLabel,
  icon,
  onClick,
}: {
  loading: boolean;

  label: string;

  loadingLabel: string;

  icon:
    ReactNode;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        loading
      }
      onClick={
        onClick
      }
      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}

      {loading
        ? loadingLabel
        : label}
    </button>
  );
}

/* ============================
   SECTION HEADER
============================ */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon:
    ReactNode;

  title: string;

  description: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ============================
   INFO CARD
============================ */

function InfoCard({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================
   NUMBER CARD
============================ */

function NumberCard({
  label,
  value,
}: {
  label: string;

  value:
    | number
    | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================
   MONEY CARD
============================ */

function MoneyCard({
  label,
  value,
}: {
  label: string;

  value:
    | number
    | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        ₹
        {formatMoney(
          value
        )}
      </p>
    </div>
  );
}

/* ============================
   WORKFLOW STEP
============================ */

function WorkflowStep({
  label,
  active,
}: {
  label: string;

  active: boolean;
}) {
  return (
    <div
      className={
        active
          ? "rounded-xl border border-blue-200 bg-blue-50 p-4 text-center font-semibold text-blue-700"
          : "rounded-xl border border-slate-200 bg-slate-50 p-4 text-center font-medium text-slate-400"
      }
    >
      {label}
    </div>
  );
}

/* ============================
   DATE
============================ */

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

/* ============================
   MONEY
============================ */

function formatMoney(
  value:
    | number
    | string
) {
  return Number(
    value ||
      0
  ).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    }
  );
}

/* ============================
   MONTHS
============================ */

const monthNames = [
  "January",

  "February",

  "March",

  "April",

  "May",

  "June",

  "July",

  "August",

  "September",

  "October",

  "November",

  "December",
];