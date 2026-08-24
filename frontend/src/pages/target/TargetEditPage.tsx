import {
  useEffect,
  useMemo,
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
  CalendarDays,
  Save,
  Target,
  TrendingUp,
  User,
} from "lucide-react";

import {
  getTargetById,
  updateTarget,
} from "../../services/target.service";

import type {
  EmployeeTarget,
} from "../../types/target.types";

export default function TargetEditPage() {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const navigate =
    useNavigate();

  const [
    target,
    setTarget,
  ] =
    useState<EmployeeTarget | null>(
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
      brokerageTarget: "",
      revenueTarget: "",
      dematTarget: "",
      achievedAmount: "",
    });

  /* ============================
     LOAD TARGET
  ============================ */

  useEffect(() => {
    const loadTarget =
      async () => {
        if (!id) {
          setError(
            "Target ID is missing"
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
            await getTargetById(
              id
            );

          const data =
            response.target;

          setTarget(
            data
          );

          setForm({
            brokerageTarget:
              String(
                data.brokerageTarget ||
                  0
              ),

            revenueTarget:
              String(
                data.revenueTarget ||
                  0
              ),

            dematTarget:
              String(
                data.dematTarget ||
                  0
              ),

            achievedAmount:
              String(
                data.achievedAmount ||
                  0
              ),
          });
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data
              ?.message ||
            error?.message ||
            "Failed to load target"
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadTarget();
  }, [id]);

  /* ============================
     PERIOD
  ============================ */

  const targetPeriod =
    useMemo(() => {
      if (!target) {
        return null;
      }

      const periodEnd =
        new Date(
          target.year,
          target.month - 1,
          25
        );

      const previousMonth =
        target.month === 1
          ? 12
          : target.month - 1;

      const previousYear =
        target.month === 1
          ? target.year - 1
          : target.year;

      const periodStart =
        new Date(
          previousYear,
          previousMonth - 1,
          26
        );

      return {
        start:
          periodStart,

        end:
          periodEnd,
      };
    }, [target]);

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
        !target
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

        await updateTarget(
          id,
          {
            brokerageTarget:
              Math.max(
                Number(
                  form.brokerageTarget ||
                    0
                ),
                0
              ),

            revenueTarget:
              Math.max(
                Number(
                  form.revenueTarget ||
                    0
                ),
                0
              ),

            dematTarget:
              Math.max(
                Math.floor(
                  Number(
                    form.dematTarget ||
                      0
                  )
                ),
                0
              ),

            achievedAmount:
              Math.max(
                Number(
                  form.achievedAmount ||
                    0
                ),
                0
              ),
          }
        );

        navigate(
          `/targets/${id}`
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Target update failed"
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
          Loading target...
        </p>
      </div>
    );
  }

  if (
    error &&
    !target
  ) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/targets"
            )
          }
          className="inline-flex items-center gap-2 text-sm text-slate-600"
        >
          <ArrowLeft
            size={17}
          />

          Back to Targets
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!target) {
    return null;
  }

  const brokerageTarget =
    Number(
      form.brokerageTarget ||
        0
    );

  const achievedAmount =
    Number(
      form.achievedAmount ||
        0
    );

  const progress =
    brokerageTarget > 0
      ? achievedAmount /
        brokerageTarget *
        100
      : 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/targets/${target.id}`
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
            Edit Target
          </h1>

          <p className="text-sm text-slate-500">
            Update target values
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EMPLOYEE */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <User
              size={20}
            />
          }
          title="Employee"
          description="Target employee is locked"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyCard
            label="Employee"
            value={
              target.employee
                ?.name ||
              "-"
            }
          />

          <ReadOnlyCard
            label="Employee Code"
            value={
              target.employee
                ?.employeeCode ||
              "-"
            }
          />

          <ReadOnlyCard
            label="Role"
            value={
              target.employee
                ?.role?.name ||
              "-"
            }
          />

          <ReadOnlyCard
            label="Branch"
            value={
              target.employee
                ?.branch?.name ||
              "-"
            }
          />
        </div>
      </section>

      {/* PERIOD */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <SectionHeader
          icon={
            <CalendarDays
              size={20}
            />
          }
          title="Target Period"
          description="Month and cycle cannot be changed"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnlyCard
            label="Target Month"
            value={`${
              monthNames[
                target.month -
                  1
              ]
            } ${
              target.year
            }`}
          />

          <ReadOnlyCard
            label="Period Start"
            value={
              targetPeriod
                ? formatDate(
                    targetPeriod.start
                  )
                : "-"
            }
          />

          <ReadOnlyCard
            label="Period End"
            value={
              targetPeriod
                ? formatDate(
                    targetPeriod.end
                  )
                : "-"
            }
          />

          <ReadOnlyCard
            label="Cycle"
            value="26th → 25th"
          />
        </div>
      </section>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* TARGET VALUES */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <Target
                size={20}
              />
            }
            title="Target Values"
            description="Update assigned monthly targets"
          />

          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Brokerage Target">
              <MoneyInput
                value={
                  form.brokerageTarget
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      brokerageTarget:
                        value,
                    })
                  )
                }
              />
            </Field>

            <Field label="Revenue Target">
              <MoneyInput
                value={
                  form.revenueTarget
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      revenueTarget:
                        value,
                    })
                  )
                }
              />
            </Field>

            <Field label="Demat Target">
              <input
                type="number"
                min="0"
                step="1"
                value={
                  form.dematTarget
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      dematTarget:
                        e.target
                          .value,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>
          </div>
        </section>

        {/* ACHIEVEMENT */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <TrendingUp
                size={20}
              />
            }
            title="Achievement"
            description="Temporary manual achievement entry"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Achieved Amount">
              <MoneyInput
                value={
                  form.achievedAmount
                }
                onChange={(
                  value
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      achievedAmount:
                        value,
                    })
                  )
                }
              />
            </Field>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Progress
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-950">
                {progress.toFixed(
                  1
                )}
                %
              </p>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-700"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        progress,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Later this field will be auto-calculated from actual brokerage/revenue transactions for the 26th–25th cycle.
          </p>
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
                `/targets/${target.id}`
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            <Save
              size={17}
            />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;

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

function Field({
  label,
  children,
}: {
  label: string;

  children: ReactNode;
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
            e.target.value
          )
        }
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}

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

function formatDate(
  date: Date
) {
  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

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