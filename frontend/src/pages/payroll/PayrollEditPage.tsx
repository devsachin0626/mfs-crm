import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Banknote,
  Save,
  WalletCards,
} from "lucide-react";

import {
  getPayrollById,
  updatePayroll,
} from "../../services/payroll.service";

import type {
  Payroll,
} from "../../types/payroll.types";

export default function PayrollEditPage() {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
    useNavigate();

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
    form,
    setForm,
  ] =
    useState({
      incentive: "0",
      bonus: "0",
      deduction: "0",
      remarks: "",
    });

  /* ============================
     LOAD PAYROLL
  ============================ */

  useEffect(() => {
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

          const data =
            response.payroll;

          setPayroll(
            data
          );

          setForm({
            incentive:
              String(
                data.incentive ||
                  0
              ),

            bonus:
              String(
                data.bonus ||
                  0
              ),

            deduction:
              String(
                data.deduction ||
                  0
              ),

            remarks:
              data.remarks ||
              "",
          });
        } catch (
          error: any
        ) {
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

    loadPayroll();
  }, [id]);

  /* ============================
     SAVE
  ============================ */

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      if (
        !id ||
        !payroll
      ) {
        return;
      }

      try {
        setSaving(
          true
        );

        setError(
          ""
        );

        await updatePayroll(
          id,
          {
            incentive:
              Math.max(
                Number(
                  form.incentive ||
                    0
                ),
                0
              ),

            bonus:
              Math.max(
                Number(
                  form.bonus ||
                    0
                ),
                0
              ),

            deduction:
              Math.max(
                Number(
                  form.deduction ||
                    0
                ),
                0
              ),

            remarks:
              form.remarks.trim() ||
              undefined,
          }
        );

        navigate(
          `/payroll/${id}`
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Payroll update failed"
        );
      } finally {
        setSaving(
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

  const calculatedNet =
    Math.max(
      Number(
        payroll.grossSalary ||
          0
      ) +
        Number(
          form.incentive ||
            0
        ) +
        Number(
          form.bonus ||
            0
        ) -
        Number(
          form.deduction ||
            0
        ) -
        Number(
          payroll.lateDeduction ||
            0
        ),
      0
    );

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/payroll/${payroll.id}`
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft
            size={19}
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Payroll
          </h1>

          <p className="text-sm text-slate-500">
            Edit only payroll adjustments
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* LOCKED PAYROLL INFO */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <Banknote
              size={20}
            />
          }
          title="Payroll Information"
          description="Attendance and salary base are locked"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyCard
            label="Employee"
            value={
              payroll.employee
                ?.name ||
              "-"
            }
          />

          <ReadOnlyCard
            label="Employee Code"
            value={
              payroll.employee
                ?.employeeCode ||
              "-"
            }
          />

          <ReadOnlyCard
            label="Payroll Month"
            value={`${monthNames[
              payroll.month - 1
            ]} ${payroll.year}`}
          />

          <ReadOnlyCard
            label="Status"
            value={
              payroll.status
            }
          />
        </div>
      </section>

      {/* ATTENDANCE */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Attendance Summary
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          These values come from the payroll policy engine and cannot be edited manually
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <ReadOnlyCard
            label="Working Days"
            value={String(
              payroll
                .scheduledWorkingDays ??
                payroll.workingDays
            )}
          />

          <ReadOnlyCard
            label="Present"
            value={String(
              payroll.presentDays
            )}
          />

          <ReadOnlyCard
            label="Late"
            value={String(
              payroll.lateDays
            )}
          />

          <ReadOnlyCard
            label="Half Day"
            value={String(
              payroll.halfDays
            )}
          />

          <ReadOnlyCard
            label="Leave"
            value={String(
              payroll.leaveDays
            )}
          />

          <ReadOnlyCard
            label="Absent"
            value={String(
              payroll.absentDays
            )}
          />
        </div>
      </section>

      {/* FIXED SALARY */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Salary Base
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Payroll base calculation is locked
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            label="Late Deduction"
            value={
              payroll.lateDeduction ||
              0
            }
          />

          <MoneyCard
            label="Current Net Salary"
            value={
              payroll.netSalary
            }
          />
        </div>
      </section>

      {/* EDITABLE */}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <WalletCards
                size={20}
              />
            }
            title="Salary Adjustments"
            description="Only these values can be edited"
          />

          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Incentive">
              <MoneyInput
                value={
                  form.incentive
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,
                      incentive:
                        value,
                    })
                  )
                }
              />
            </Field>

            <Field label="Bonus">
              <MoneyInput
                value={
                  form.bonus
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,
                      bonus:
                        value,
                    })
                  )
                }
              />
            </Field>

            <Field label="Other Deduction">
              <MoneyInput
                value={
                  form.deduction
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,
                      deduction:
                        value,
                    })
                  )
                }
              />
            </Field>
          </div>

          {/* LIVE NET */}

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Updated Net Salary
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-950">
              ₹
              {formatMoney(
                calculatedNet
              )}
            </p>

            <p className="mt-2 text-xs text-blue-700">
              Gross + Incentive + Bonus - Other Deduction - Late Deduction
            </p>
          </div>
        </section>

        {/* REMARKS */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <Field label="Remarks">
            <textarea
              rows={4}
              maxLength={
                500
              }
              value={
                form.remarks
              }
              onChange={(
                e
              ) =>
                setForm(
                  (
                    previous
                  ) => ({
                    ...previous,

                    remarks:
                      e.target
                        .value,
                  })
                )
              }
              placeholder="Enter payroll remarks..."
              className={
                inputClass
              }
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {
                form.remarks
                  .length
              }
              /500
            </p>
          </Field>
        </section>

        {/* ACTIONS */}

        <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              navigate(
                `/payroll/${payroll.id}`
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              payroll.status ===
                "PAID"
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              size={17}
            />

            {saving
              ? "Saving..."
              : payroll.status ===
                  "PAID"
                ? "Payroll Locked"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/* ============================
   FIELD
============================ */

function Field({
  label,
  children,
}: {
  label: string;

  children:
    ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      {children}
    </label>
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
   MONEY INPUT
============================ */

function MoneyInput({
  value,
  onChange,
}: {
  value: string;

  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">
        ₹
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={
          value
        }
        onChange={(
          e
        ) =>
          onChange(
            e.target
              .value
          )
        }
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}

/* ============================
   READ ONLY
============================ */

function ReadOnlyCard({
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
   MONEY CARD
============================ */

function MoneyCard({
  label,
  value,
}: {
  label: string;

  value:
    | string
    | number;
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
   FORMAT MONEY
============================ */

function formatMoney(
  value:
    | number
    | string
) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
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