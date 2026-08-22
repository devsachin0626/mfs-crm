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
  Banknote,
} from "lucide-react";

import {
  createPayroll,
} from "../../services/payroll.service";

import {
  getEmployees,
  getEmployeeById,
} from "../../services/employee.service";

import {
  getMonthlyAttendanceReport,
} from "../../services/attendance.service";

import type {
  Employee,
} from "../../types/employee.types";

export default function PayrollCreatePage() {
  const navigate = useNavigate();

  const now = new Date();

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [loadingAttendance, setLoadingAttendance] =
    useState(false);

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

      basicSalary: "",

      workingDays: "",
      presentDays: "",
      lateDays: "",
      halfDays: "",
      leaveDays: "",
      absentDays: "",

      grossSalary: "",

      incentive: "",
      bonus: "",
      deduction: "",

      netSalary: "",

      status: "PENDING",

      remarks: "",
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

  const loadEmployeePayrollData =
    async (
      employeeId: string,
      month: number,
      year: number
    ) => {
      if (!employeeId) return;

      try {
        setLoadingAttendance(
          true
        );

        setError("");

        const [
          employeeResponse,
          attendanceResponse,
        ] = await Promise.all([
          getEmployeeById(
            employeeId
          ),

          getMonthlyAttendanceReport(
            employeeId,
            month,
            year
          ),
        ]);

        const employee =
          employeeResponse.employee;

        const summary =
          attendanceResponse.summary;

        const basicSalary =
          Number(
            employee.salary || 0
          );

        const presentDays =
          Number(
            summary.present || 0
          );

        const lateDays =
          Number(
            summary.late || 0
          );

        const halfDays =
          Number(
            summary.halfDay || 0
          );

        const leaveDays =
          Number(
            summary.leave || 0
          );

        const absentDays =
          Number(
            summary.absent || 0
          );

        const workingDays =
          Number(
            summary.totalRecords || 0
          );

        const grossSalary =
          basicSalary;

        setForm((prev) => ({
          ...prev,

          basicSalary:
            String(
              basicSalary
            ),

          workingDays:
            String(
              workingDays
            ),

          presentDays:
            String(
              presentDays
            ),

          lateDays:
            String(
              lateDays
            ),

          halfDays:
            String(
              halfDays
            ),

          leaveDays:
            String(
              leaveDays
            ),

          absentDays:
            String(
              absentDays
            ),

          grossSalary:
            String(
              grossSalary
            ),
        }));
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            "Failed to load attendance data"
        );
      } finally {
        setLoadingAttendance(
          false
        );
      }
    };

  useEffect(() => {
    if (
      form.employeeId
    ) {
      loadEmployeePayrollData(
        form.employeeId,
        form.month,
        form.year
      );
    }
  }, [
    form.employeeId,
    form.month,
    form.year,
  ]);

  useEffect(() => {
    const grossSalary =
      Number(
        form.grossSalary || 0
      );

    const incentive =
      Number(
        form.incentive || 0
      );

    const bonus =
      Number(
        form.bonus || 0
      );

    const deduction =
      Number(
        form.deduction || 0
      );

    const netSalary =
      grossSalary +
      incentive +
      bonus -
      deduction;

    setForm((prev) => ({
      ...prev,

      netSalary:
        String(
          Math.max(
            netSalary,
            0
          )
        ),
    }));
  }, [
    form.grossSalary,
    form.incentive,
    form.bonus,
    form.deduction,
  ]);

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

      try {
        setSaving(true);

        await createPayroll({
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

          basicSalary:
            Number(
              form.basicSalary ||
                0
            ),

          workingDays:
            Number(
              form.workingDays ||
                0
            ),

          presentDays:
            Number(
              form.presentDays ||
                0
            ),

          lateDays:
            Number(
              form.lateDays ||
                0
            ),

          halfDays:
            Number(
              form.halfDays ||
                0
            ),

          leaveDays:
            Number(
              form.leaveDays ||
                0
            ),

          absentDays:
            Number(
              form.absentDays ||
                0
            ),

          grossSalary:
            Number(
              form.grossSalary ||
                0
            ),

          incentive:
            Number(
              form.incentive ||
                0
            ),

          bonus:
            Number(
              form.bonus ||
                0
            ),

          deduction:
            Number(
              form.deduction ||
                0
            ),

          netSalary:
            Number(
              form.netSalary ||
                0
            ),

          status:
            form.status as
              | "PENDING"
              | "PROCESSED"
              | "PAID",

          remarks:
            form.remarks.trim() ||
            undefined,
        });

        navigate(
          "/payroll"
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data?.message ||
            error?.message ||
            "Payroll creation failed"
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
              "/payroll"
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
            Create Payroll
          </h1>

          <p className="text-sm text-slate-500">
            Generate monthly
            employee payroll
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
        {/* Payroll Header */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Banknote
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Payroll Information
              </h2>

              <p className="text-sm text-slate-500">
                Select employee and
                payroll month
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
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
                        e.target
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
                    name,
                    index
                  ) => (
                    <option
                      key={
                        name
                      }
                      value={
                        index +
                        1
                      }
                    >
                      {name}
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
          </div>

          {loadingAttendance && (
            <p className="mt-4 text-sm text-blue-600">
              Loading attendance
              summary...
            </p>
          )}
        </section>

        {/* Attendance */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Attendance Summary
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField
              label="Working Days"
              value={
                form.workingDays
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    workingDays:
                      value,
                  })
                )
              }
            />

            <NumberField
              label="Present Days"
              value={
                form.presentDays
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    presentDays:
                      value,
                  })
                )
              }
            />

            <NumberField
              label="Late Days"
              value={
                form.lateDays
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    lateDays:
                      value,
                  })
                )
              }
            />

            <NumberField
              label="Half Days"
              value={
                form.halfDays
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    halfDays:
                      value,
                  })
                )
              }
            />

            <NumberField
              label="Leave Days"
              value={
                form.leaveDays
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    leaveDays:
                      value,
                  })
                )
              }
            />

            <NumberField
              label="Absent Days"
              value={
                form.absentDays
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    absentDays:
                      value,
                  })
                )
              }
            />
          </div>
        </section>

        {/* Salary */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Salary Breakdown
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <MoneyField
              label="Basic Salary"
              value={
                form.basicSalary
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    basicSalary:
                      value,
                  })
                )
              }
            />

            <MoneyField
              label="Gross Salary"
              value={
                form.grossSalary
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    grossSalary:
                      value,
                  })
                )
              }
            />

            <MoneyField
              label="Incentive"
              value={
                form.incentive
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    incentive:
                      value,
                  })
                )
              }
            />

            <MoneyField
              label="Bonus"
              value={
                form.bonus
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    bonus:
                      value,
                  })
                )
              }
            />

            <MoneyField
              label="Deduction"
              value={
                form.deduction
              }
              onChange={(
                value
              ) =>
                setForm(
                  (prev) => ({
                    ...prev,
                    deduction:
                      value,
                  })
                )
              }
            />

            <MoneyField
              label="Net Salary"
              value={
                form.netSalary
              }
              readOnly
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Status">
              <select
                value={
                  form.status
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      status:
                        e.target
                          .value,
                    })
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="PROCESSED">
                  Processed
                </option>

                <option value="PAID">
                  Paid
                </option>
              </select>
            </Field>

            <Field label="Remarks">
              <textarea
                rows={3}
                value={
                  form.remarks
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      remarks:
                        e.target
                          .value,
                    })
                  )
                }
                className={
                  inputClass
                }
                placeholder="Payroll remarks..."
              />
            </Field>
          </div>
        </section>

        {/* Buttons */}

        <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              navigate(
                "/payroll"
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            <Save
              size={17}
            />

            {saving
              ? "Creating..."
              : "Create Payroll"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={
          inputClass
        }
      />
    </Field>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (
    value: string
  ) => void;
  readOnly?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          ₹
        </span>

        <input
          type="number"
          min="0"
          value={value}
          readOnly={
            readOnly
          }
          onChange={(e) =>
            onChange?.(
              e.target.value
            )
          }
          className={`${inputClass} pl-8 ${
            readOnly
              ? "bg-slate-50"
              : ""
          }`}
        />
      </div>
    </Field>
  );
}