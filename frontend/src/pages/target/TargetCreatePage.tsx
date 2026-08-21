import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Target,
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
  const navigate = useNavigate();

  const now = new Date();

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      employeeId: "",
      month:
        now.getMonth() + 1,
      year:
        now.getFullYear(),

      brokerageTarget: "",
      dematTarget: "",
      revenueTarget: "",
    });

  useEffect(() => {
    const loadEmployees =
      async () => {
        try {
          setLoadingEmployees(
            true
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
              ?.data?.message ||
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

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      setError("");

      if (!form.employeeId) {
        setError(
          "Employee is required"
        );
        return;
      }

      try {
        setSaving(true);

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

          dematTarget:
            Number(
              form.dematTarget ||
                0
            ),

          revenueTarget:
            Number(
              form.revenueTarget ||
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
            ?.data?.message ||
            error?.message ||
            "Target creation failed"
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="space-y-6">
      {/* Header */}

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
            Assign Target
          </h1>

          <p className="text-sm text-slate-500">
            Create monthly
            employee target
          </p>
        </div>
      </div>

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
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Target
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Target Information
              </h2>

              <p className="text-sm text-slate-500">
                Set monthly
                brokerage,
                demat and
                revenue targets
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Employee"
              required
            >
              <select
                value={
                  form.employeeId
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      employeeId:
                        e
                          .target
                          .value,
                    })
                  )
                }
                disabled={
                  loadingEmployees
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  {loadingEmployees
                    ? "Loading employees..."
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
              label="Month"
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
                      prev
                    ) => ({
                      ...prev,
                      month:
                        Number(
                          e
                            .target
                            .value
                        ),
                    })
                  )
                }
                className={
                  inputClass
                }
              >
                {[
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
                ].map(
                  (
                    monthName,
                    index
                  ) => (
                    <option
                      key={
                        monthName
                      }
                      value={
                        index +
                        1
                      }
                    >
                      {
                        monthName
                      }
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Year"
              required
            >
              <select
                value={
                  form.year
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      year:
                        Number(
                          e
                            .target
                            .value
                        ),
                    })
                  )
                }
                className={
                  inputClass
                }
              >
                {[
                  now.getFullYear() -
                    1,
                  now.getFullYear(),
                  now.getFullYear() +
                    1,
                ].map(
                  (year) => (
                    <option
                      key={
                        year
                      }
                      value={
                        year
                      }
                    >
                      {year}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Brokerage Target">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={
                    form.brokerageTarget
                  }
                  onChange={(
                    e
                  ) =>
                    setForm(
                      (
                        prev
                      ) => ({
                        ...prev,
                        brokerageTarget:
                          e
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="0"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>

            <Field label="Demat Target">
              <input
                type="number"
                min="0"
                value={
                  form.dematTarget
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      dematTarget:
                        e
                          .target
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

            <Field label="Revenue Target">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  value={
                    form.revenueTarget
                  }
                  onChange={(
                    e
                  ) =>
                    setForm(
                      (
                        prev
                      ) => ({
                        ...prev,
                        revenueTarget:
                          e
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="0"
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>
          </div>
        </section>

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
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Save
              size={17}
            />

            {saving
              ? "Assigning..."
              : "Assign Target"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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