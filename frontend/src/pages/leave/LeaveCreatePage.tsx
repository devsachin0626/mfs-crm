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
  CalendarDays,
  Send,
} from "lucide-react";

import {
  applyLeave,
} from "../../services/leave.service";

import {
  getEmployees,
} from "../../services/employee.service";

import type {
  Employee,
} from "../../types/employee.types";

export default function LeaveCreatePage() {
  const navigate = useNavigate();

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
      fromDate: "",
      toDate: "",
      reason: "",
    });

  useEffect(() => {
    const loadEmployees =
      async () => {
        try {
          setLoadingEmployees(true);

          const response =
            await getEmployees({
              page: 1,
              limit: 100,
            });

          setEmployees(
            response.employees || []
          );
        } catch (error: any) {
          setError(
            error?.response?.data?.message ||
              "Failed to load employees"
          );
        } finally {
          setLoadingEmployees(false);
        }
      };

    loadEmployees();
  }, []);

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (
      !form.employeeId ||
      !form.fromDate ||
      !form.toDate
    ) {
      setError(
        "Employee, From Date and To Date are required"
      );

      return;
    }

    if (
      new Date(form.fromDate) >
      new Date(form.toDate)
    ) {
      setError(
        "From Date cannot be greater than To Date"
      );

      return;
    }

    try {
      setSaving(true);

      await applyLeave({
        employeeId:
          form.employeeId,

        fromDate:
          form.fromDate,

        toDate:
          form.toDate,

        reason:
          form.reason.trim() ||
          undefined,
      });

      navigate("/leaves");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Leave application failed"
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
            navigate("/leaves")
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Apply Leave
          </h1>

          <p className="text-sm text-slate-500">
            Create a new leave request
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Leave Information
              </h2>

              <p className="text-sm text-slate-500">
                Select employee and leave dates
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Employee"
              required
            >
              <select
                value={form.employeeId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    employeeId:
                      e.target.value,
                  }))
                }
                disabled={loadingEmployees}
                className={inputClass}
              >
                <option value="">
                  {loadingEmployees
                    ? "Loading Employees..."
                    : "Select Employee"}
                </option>

                {employees.map(
                  (employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
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
            </Field>

            <Field
              label="From Date"
              required
            >
              <input
                type="date"
                value={form.fromDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fromDate:
                      e.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field
              label="To Date"
              required
            >
              <input
                type="date"
                value={form.toDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    toDate:
                      e.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Reason">
              <textarea
                value={form.reason}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    reason:
                      e.target.value,
                  }))
                }
                rows={4}
                placeholder="Enter leave reason..."
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              navigate("/leaves")
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Send size={17} />

            {saving
              ? "Submitting..."
              : "Apply Leave"}
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