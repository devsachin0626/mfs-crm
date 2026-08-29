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
} from "react-router-dom";

import {
  ArrowLeft,
  Banknote,
  Calculator,
  CalendarDays,
  Clock3,
  Save,
  Umbrella,
  UserCheck,
  UserX,
  WalletCards,
} from "lucide-react";

import {
  createPayroll,
  previewPayroll,
} from "../../services/payroll.service";

import {
  getEmployees,
} from "../../services/employee.service";

import type {
  Employee,
} from "../../types/employee.types";

import type {
  PayrollPreviewResponse,
} from "../../types/payroll.types";

export default function PayrollCreatePage() {
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
    previewLoading,
    setPreviewLoading,
  ] =
    useState(false);

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
    preview,
    setPreview,
  ] =
    useState<PayrollPreviewResponse | null>(
      null
    );

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

      incentive: "0",

      bonus: "0",

      deduction: "0",

      remarks: "",
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
     PREVIEW
  ============================ */

  const loadPreview =
    async () => {
      if (
        !form.employeeId
      ) {
        setPreview(
          null
        );

        return;
      }

      try {
        setPreviewLoading(
          true
        );

        setError(
          ""
        );

        const response =
          await previewPayroll({
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
          });

        setPreview(
          response
        );
      } catch (
        error: any
      ) {
        setPreview(
          null
        );

        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Failed to calculate payroll"
        );
      } finally {
        setPreviewLoading(
          false
        );
      }
    };

  /* ============================
     AUTO PREVIEW
  ============================ */

  useEffect(() => {
    if (
      !form.employeeId
    ) {
      setPreview(
        null
      );

      return;
    }

    const timer =
      setTimeout(
        () => {
          loadPreview();
        },
        350
      );

    return () => {
      clearTimeout(
        timer
      );
    };
  }, [
    form.employeeId,
    form.month,
    form.year,
    form.incentive,
    form.bonus,
    form.deduction,
  ]);

  /* ============================
     CREATE PAYROLL
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
        !preview
      ) {
        setError(
          "Payroll preview is not available"
        );

        return;
      }

      try {
        setSaving(
          true
        );

        /*
         * Backend policy engine
         * salary aur attendance
         * dobara calculate karega.
         *
         * Ye values legacy
         * CreatePayrollPayload
         * compatibility ke liye
         * bhej rahe hain.
         */

     await createPayroll({
  employeeId:
    form.employeeId,

  month:
    Number(form.month),

  year:
    Number(form.year),

  incentive:
    Number(
      form.incentive || 0
    ),

  bonus:
    Number(
      form.bonus || 0
    ),

  deduction:
    Number(
      form.deduction || 0
    ),

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
            ?.data
            ?.message ||
            error?.message ||
            "Payroll creation failed"
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div className="space-y-6">
      {/* ============================
          HEADER
      ============================ */}

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
          <h1 className="text-2xl font-bold text-slate-900">
            Create Payroll
          </h1>

          <p className="text-sm text-slate-500">
            26th to 25th payroll cycle
          </p>
        </div>
      </div>

      {/* ============================
          ERROR
      ============================ */}

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
        {/* ============================
            PAYROLL INFORMATION
        ============================ */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <Banknote
                size={20}
              />
            }
            title="Payroll Information"
            description="Select employee and payroll cycle"
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
              label="Payroll Month"
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

          {/* ============================
              PAYROLL PERIOD
          ============================ */}

          {preview && (
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <CalendarDays
                  size={18}
                />

                <span className="font-semibold">
                  Payroll Period
                </span>
              </div>

              <p className="mt-2 text-sm text-blue-700">
                {formatDate(
                  preview.period
                    .start
                )}
                {" → "}
                {formatDate(
                  preview.period
                    .end
                )}
              </p>
            </div>
          )}
        </section>

        {/* ============================
            ADJUSTMENTS
        ============================ */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <WalletCards
                size={20}
              />
            }
            title="Salary Adjustments"
            description="Add monthly incentive, bonus or other deduction"
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
        </section>

        {/* ============================
            PREVIEW
        ============================ */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <SectionHeader
            icon={
              <Calculator
                size={20}
              />
            }
            title="Payroll Preview"
            description="Salary automatically calculated from attendance and office policy"
          />

          {!form.employeeId && (
            <EmptyPreview />
          )}

          {previewLoading && (
            <div className="rounded-xl bg-slate-50 p-8 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

              <p className="mt-3 text-sm text-slate-500">
                Calculating payroll...
              </p>
            </div>
          )}

          {!previewLoading &&
            preview && (
              <div className="space-y-6">
                {/* ============================
                    MAIN SALARY
                ============================ */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MoneyCard
                    label="Basic Salary"
                    value={
                      preview.salary
                        .basicSalary
                    }
                  />

                  <MoneyCard
                    label="Per Day Salary"
                    value={
                      preview.salary
                        .perDaySalary
                    }
                  />

                  <NumberCard
                    label="Payable Days"
                    value={
                      preview.salary
                        .payableDays
                    }
                  />

                  <MoneyCard
                    label="Gross Salary"
                    value={
                      preview.salary
                        .grossSalary
                    }
                  />
                </div>

                {/* ============================
                    ATTENDANCE
                ============================ */}

                <div>
                  <SubHeading
                    icon={
                      <UserCheck
                        size={18}
                      />
                    }
                    title="Attendance Calculation"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    <NumberCard
                      label="Working Days"
                      value={
                        preview
                          .attendance
                          .scheduledWorkingDays
                      }
                    />

                    <NumberCard
                      label="Present"
                      value={
                        preview
                          .attendance
                          .presentDays
                      }
                    />

                    <NumberCard
                      label="Late"
                      value={
                        preview
                          .attendance
                          .lateDays
                      }
                    />

                    <NumberCard
                      label="Half Day"
                      value={
                        preview
                          .attendance
                          .halfDays
                      }
                    />

                    <NumberCard
                      label="Absent"
                      value={
                        preview
                          .attendance
                          .absentDays
                      }
                    />
                  </div>
                </div>

                {/* ============================
                    LEAVE
                ============================ */}

                <div>
                  <SubHeading
                    icon={
                      <Umbrella
                        size={18}
                      />
                    }
                    title="Paid Leave"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <NumberCard
                      label="Opening Balance"
                      value={
                        preview
                          .leaveBalance
                          .openingBalance
                      }
                    />

                    <NumberCard
                      label="Monthly Credit"
                      value={
                        preview
                          .leaveBalance
                          .creditedLeave
                      }
                    />

                    <NumberCard
                      label="Paid Leave Used"
                      value={
                        preview
                          .leaveBalance
                          .usedPaidLeave
                      }
                    />

                    <NumberCard
                      label="Closing Balance"
                      value={
                        preview
                          .leaveBalance
                          .closingBalance
                      }
                    />

                    <NumberCard
                      label="Total Leave"
                      value={
                        preview
                          .attendance
                          .approvedLeaveDays
                      }
                    />

                    <NumberCard
                      label="Paid Leave"
                      value={
                        preview
                          .attendance
                          .paidLeaveDays
                      }
                    />

                    <NumberCard
                      label="Unpaid Leave"
                      value={
                        preview
                          .attendance
                          .unpaidLeaveDays
                      }
                    />

                    <NumberCard
                      label="Available Leave"
                      value={
                        preview
                          .leaveBalance
                          .availablePaidLeave
                      }
                    />
                  </div>
                </div>

                {/* ============================
                    LATE POLICY
                ============================ */}

                <div>
                  <SubHeading
                    icon={
                      <Clock3
                        size={18}
                      />
                    }
                    title="Late Coming"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <NumberCard
                      label="Total Late"
                      value={
                        preview
                          .attendance
                          .actualLateCount
                      }
                    />

                    <NumberCard
                      label="Allowed Late"
                      value={
                        preview
                          .attendance
                          .allowedLateCount
                      }
                    />

                    <NumberCard
                      label="Excess Late"
                      value={
                        preview
                          .attendance
                          .excessLateCount
                      }
                    />

                    <MoneyCard
                      label="Late Deduction"
                      value={
                        preview.salary
                          .lateDeduction
                      }
                    />
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    First 3 late
                    arrivals are
                    allowed. ₹100 is
                    deducted for each
                    additional late.
                  </p>
                </div>

                {/* ============================
                    EARLY GOING
                ============================ */}

                <div>
                  <SubHeading
                    icon={
                      <UserX
                        size={18}
                      />
                    }
                    title="Early Going"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <NumberCard
                      label="Early Going"
                      value={
                        preview
                          .attendance
                          .earlyGoingCount
                      }
                    />

                    <NumberCard
                      label="Allowed"
                      value={
                        preview
                          .attendance
                          .allowedEarlyGoingCount
                      }
                    />
                  </div>
                </div>

                {/* ============================
                    FINAL SALARY
                ============================ */}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <h3 className="font-semibold text-blue-950">
                    Final Salary Calculation
                  </h3>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <SalaryRow
                      label="Gross Salary"
                      amount={
                        preview.salary
                          .grossSalary
                      }
                    />

                    <SalaryRow
                      label="+ Incentive"
                      amount={
                        preview.salary
                          .incentive
                      }
                    />

                    <SalaryRow
                      label="+ Bonus"
                      amount={
                        preview.salary
                          .bonus
                      }
                    />

                    <SalaryRow
                      label="- Other Deduction"
                      amount={
                        preview.salary
                          .otherDeduction
                      }
                    />

                    <SalaryRow
                      label="- Late Deduction"
                      amount={
                        preview.salary
                          .lateDeduction
                      }
                    />

                    <div className="rounded-xl bg-blue-700 p-4 text-white">
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                        Net Salary
                      </p>

                      <p className="mt-2 text-2xl font-bold">
                        ₹
                        {formatMoney(
                          preview.salary
                            .netSalary
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </section>

        {/* ============================
            REMARKS
        ============================ */}

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

        {/* ============================
            ACTIONS
        ============================ */}

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
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              previewLoading ||
              !preview
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save
              size={17}
            />

            {saving
              ? "Creating Payroll..."
              : "Create Payroll"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================
   INPUT STYLE
============================ */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
   SUB HEADING
============================ */

function SubHeading({
  icon,
  title,
}: {
  icon:
    ReactNode;

  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-800">
      <span className="text-blue-700">
        {icon}
      </span>

      <h3 className="font-semibold">
        {title}
      </h3>
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
   SALARY ROW
============================ */

function SalaryRow({
  label,
  amount,
}: {
  label: string;

  amount:
    | number
    | string;
}) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        ₹
        {formatMoney(
          amount
        )}
      </p>
    </div>
  );
}

/* ============================
   EMPTY PREVIEW
============================ */

function EmptyPreview() {
  return (
    <div className="rounded-xl bg-slate-50 p-8 text-center">
      <Calculator
        size={34}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 font-medium text-slate-700">
        Select Employee
      </p>

      <p className="mt-1 text-sm text-slate-500">
        Payroll calculation will appear automatically.
      </p>
    </div>
  );
}

/* ============================
   MONEY FORMAT
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
      minimumFractionDigits:
        0,

      maximumFractionDigits:
        2,
    }
  );
}

/* ============================
   DATE FORMAT
============================ */

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
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