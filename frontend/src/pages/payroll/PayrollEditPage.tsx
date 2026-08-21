import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  getPayrollById,
  updatePayroll,
} from "../../services/payroll.service";

export default function PayrollEditPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [employeeName, setEmployeeName] =
    useState("");

  const [form, setForm] =
    useState({
      month: 1,
      year: new Date().getFullYear(),

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
    const loadPayroll = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const response =
          await getPayrollById(id);

        const payroll =
          response.payroll;

        setEmployeeName(
          `${payroll.employee.name} - ${payroll.employee.employeeCode}`
        );

        setForm({
          month:
            payroll.month,

          year:
            payroll.year,

          basicSalary:
            String(
              payroll.basicSalary
            ),

          workingDays:
            String(
              payroll.workingDays
            ),

          presentDays:
            String(
              payroll.presentDays
            ),

          lateDays:
            String(
              payroll.lateDays
            ),

          halfDays:
            String(
              payroll.halfDays
            ),

          leaveDays:
            String(
              payroll.leaveDays
            ),

          absentDays:
            String(
              payroll.absentDays
            ),

          grossSalary:
            String(
              payroll.grossSalary
            ),

          incentive:
            String(
              payroll.incentive
            ),

          bonus:
            String(
              payroll.bonus
            ),

          deduction:
            String(
              payroll.deduction
            ),

          netSalary:
            String(
              payroll.netSalary
            ),

          status:
            payroll.status,

          remarks:
            payroll.remarks || "",
        });
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load payroll"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayroll();
  }, [id]);

  useEffect(() => {
    const net =
      Number(
        form.grossSalary || 0
      ) +
      Number(
        form.incentive || 0
      ) +
      Number(
        form.bonus || 0
      ) -
      Number(
        form.deduction || 0
      );

    setForm((prev) => ({
      ...prev,
      netSalary:
        String(
          Math.max(net, 0)
        ),
    }));
  }, [
    form.grossSalary,
    form.incentive,
    form.bonus,
    form.deduction,
  ]);

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await updatePayroll(
        id,
        {
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
            form.remarks ||
            undefined,
        }
      );

      navigate(
        `/payroll/${id}`
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Payroll update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading payroll...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/payroll/${id}`
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Payroll
          </h1>

          <p className="text-sm text-slate-500">
            {employeeName}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <NumberField
              label="Working Days"
              value={form.workingDays}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  workingDays: v,
                }))
              }
            />

            <NumberField
              label="Present Days"
              value={form.presentDays}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  presentDays: v,
                }))
              }
            />

            <NumberField
              label="Late Days"
              value={form.lateDays}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  lateDays: v,
                }))
              }
            />

            <NumberField
              label="Half Days"
              value={form.halfDays}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  halfDays: v,
                }))
              }
            />

            <NumberField
              label="Leave Days"
              value={form.leaveDays}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  leaveDays: v,
                }))
              }
            />

            <NumberField
              label="Absent Days"
              value={form.absentDays}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  absentDays: v,
                }))
              }
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <MoneyField
              label="Basic Salary"
              value={form.basicSalary}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  basicSalary: v,
                }))
              }
            />

            <MoneyField
              label="Gross Salary"
              value={form.grossSalary}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  grossSalary: v,
                }))
              }
            />

            <MoneyField
              label="Incentive"
              value={form.incentive}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  incentive: v,
                }))
              }
            />

            <MoneyField
              label="Bonus"
              value={form.bonus}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  bonus: v,
                }))
              }
            />

            <MoneyField
              label="Deduction"
              value={form.deduction}
              onChange={(v) =>
                setForm((p) => ({
                  ...p,
                  deduction: v,
                }))
              }
            />

            <MoneyField
              label="Net Salary"
              value={form.netSalary}
              readOnly
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status:
                      e.target.value,
                  }))
                }
                className={inputClass}
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
                value={form.remarks}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    remarks:
                      e.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/payroll/${id}`
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-white disabled:opacity-50"
          >
            <Save size={17} />

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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        className={inputClass}
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
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min="0"
        value={value}
        readOnly={readOnly}
        onChange={(e) =>
          onChange?.(
            e.target.value
          )
        }
        className={`${inputClass} ${
          readOnly
            ? "bg-slate-50"
            : ""
        }`}
      />
    </Field>
  );
}