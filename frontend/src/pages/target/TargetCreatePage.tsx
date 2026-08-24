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
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Save,
  Target,
  User,
} from "lucide-react";

import {
  createTarget,
} from "../../services/target.service";

import {
  getEmployees,
} from "../../services/employee.service";

import type {
  Employee,
} from "../../types/employee.types";

export default function TargetCreatePage() {
  const navigate =
    useNavigate();

  const now =
    new Date();

  const [
    employees,
    setEmployees,
  ] =
    useState<Employee[]>(
      []
    );

  const [
    loadingEmployees,
    setLoadingEmployees,
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
      employeeId: "",

      month:
        now.getMonth() +
        1,

      year:
        now.getFullYear(),

      brokerageTarget: "",

      revenueTarget: "",

      dematTarget: "",
    });

  /* ============================
     LOAD EMPLOYEES
  ============================ */

  useEffect(() => {
    const loadEmployees =
      async () => {
        try {
          setLoadingEmployees(
            true
          );

          setError(
            ""
          );

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
          error: any
        ) {
          setError(
            error?.response
              ?.data
              ?.message ||
              "Failed to load employees"
          );
        } finally {
          setLoadingEmployees(
            false
          );
        }
      };

    loadEmployees();
  }, []);

  /* ============================
     TARGET CYCLE
  ============================ */

  const targetPeriod =
    useMemo(() => {
      const periodEnd =
        new Date(
          form.year,
          form.month - 1,
          25
        );

      const previousMonth =
        form.month === 1
          ? 12
          : form.month - 1;

      const previousYear =
        form.month === 1
          ? form.year - 1
          : form.year;

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
    }, [
      form.month,
      form.year,
    ]);

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      setError("");

      if (
        !form.employeeId
      ) {
        setError(
          "Employee is required"
        );

        return;
      }

      if (
        Number(
          form.brokerageTarget
        ) < 0 ||
        Number(
          form.revenueTarget
        ) < 0 ||
        Number(
          form.dematTarget
        ) < 0
      ) {
        setError(
          "Target values cannot be negative"
        );

        return;
      }

      try {
        setSaving(
          true
        );

        await createTarget({
          employeeId:
            form.employeeId,

          month:
            Number(
              form.month
            ),

          year:
            Number(
              form.year
            ),

          brokerageTarget:
            Number(
              form.brokerageTarget ||
                0
            ),

          revenueTarget:
            Number(
              form.revenueTarget ||
                0
            ),

          dematTarget:
            Number(
              form.dematTarget ||
                0
            ),
        });

        navigate(
          "/targets"
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Target creation failed"
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/targets"
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
            Create Target
          </h1>

          <p className="text-sm text-slate-500">
            Assign monthly employee target
          </p>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* TARGET INFORMATION */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <Target
                size={20}
              />
            }
            title="Target Information"
            description="Select employee and target cycle"
          />

          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Employee"
              required
            >
              <select
                value={
                  form.employeeId
                }
                disabled={
                  loadingEmployees
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      employeeId:
                        e.target
                          .value,
                    })
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  {loadingEmployees
                    ? "Loading Employees..."
                    : "Select Employee"}
                </option>

                {employees.map(
                  (
                    employee
                  ) => (
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
                      }{" "}
                      -{" "}
                      {
                        employee.employeeCode
                      }
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Target Month"
              required
            >
              <select
                value={
                  form.month
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      month:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  )
                }
                className={
                  inputClass
                }
              >
                {monthNames.map(
                  (
                    month,
                    index
                  ) => (
                    <option
                      key={
                        month
                      }
                      value={
                        index +
                        1
                      }
                    >
                      {month}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Year"
              required
            >
              <input
                type="number"
                min={2020}
                max={2100}
                value={
                  form.year
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      year:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>
          </div>

          {/* PERIOD PREVIEW */}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <CalendarDays
                size={18}
              />

              <span className="font-semibold">
                Target Period
              </span>
            </div>

            <p className="mt-2 text-sm text-blue-700">
              {formatDate(
                targetPeriod.start
              )}
              {" → "}
              {formatDate(
                targetPeriod.end
              )}
            </p>

            <p className="mt-1 text-xs text-blue-600">
              All target achievement between these dates will count in{" "}
              {
                monthNames[
                  form.month - 1
                ]
              }{" "}
              {form.year}.
            </p>
          </div>
        </section>

        {/* TARGET VALUES */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <User
                size={20}
              />
            }
            title="Monthly Targets"
            description="Set brokerage, revenue and demat targets"
          />

          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Brokerage Target"
              required
            >
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

            <Field
              label="Revenue Target"
              required
            >
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

            <Field
              label="Demat Target"
              required
            >
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
                placeholder="0"
                className={
                  inputClass
                }
              />
            </Field>
          </div>
        </section>

        {/* SUMMARY */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Target Preview
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Target Month"
              value={`${
                monthNames[
                  form.month - 1
                ]
              } ${
                form.year
              }`}
            />

            <SummaryCard
              label="Brokerage"
              value={`₹${formatMoney(
                form.brokerageTarget
              )}`}
            />

            <SummaryCard
              label="Revenue"
              value={`₹${formatMoney(
                form.revenueTarget
              )}`}
            />

            <SummaryCard
              label="Demat"
              value={
                form.dematTarget ||
                "0"
              }
            />
          </div>
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
                "/targets"
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
              ? "Creating..."
              : "Create Target"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================
   FIELD
============================ */

function Field({
  label,
  required = false,
  children,
}: {
  label: string;

  required?: boolean;

  children:
    ReactNode;
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
            e.target.value
          )
        }
        placeholder="0"
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}

/* ============================
   SUMMARY CARD
============================ */

function SummaryCard({
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

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* ============================
   INPUT CLASS
============================ */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/* ============================
   FORMAT MONEY
============================ */

function formatMoney(
  value: string
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
   DATE FORMAT
============================ */

function formatDate(
  value: Date
) {
  return value.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
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