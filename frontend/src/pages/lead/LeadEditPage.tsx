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
  UserRoundPen,
} from "lucide-react";

import {
  getLeadById,
  updateLead,
} from "../../services/lead.service";

import {
  getLeadSources,
} from "../../services/leadSource.service";

import {
  getEmployees,
} from "../../services/employee.service";

import type {
  LeadSource,
} from "../../types/lead.types";

import type {
  Employee,
} from "../../types/employee.types";

export default function LeadEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sources, setSources] =
    useState<LeadSource[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      name: "",
      mobile: "",
      email: "",
      city: "",
      state: "",
      address: "",
      sourceId: "",
      assignedEmployeeId: "",
      stage: "NEW",
      nextFollowUp: "",
      remarks: "",
    });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const [
          leadResponse,
          sourceResponse,
          employeeResponse,
        ] = await Promise.all([
          getLeadById(id),

          getLeadSources(),

          getEmployees({
            page: 1,
            limit: 100,
          }),
        ]);

        const lead =
          leadResponse.lead;

        setSources(
          sourceResponse.leadSources ||
            []
        );

        setEmployees(
          employeeResponse.employees ||
            []
        );

        setForm({
          name:
            lead.name || "",

          mobile:
            lead.mobile || "",

          email:
            lead.email || "",

          city:
            lead.city || "",

          state:
            lead.state || "",

          address:
            lead.address || "",

          sourceId:
            lead.sourceId || "",

          assignedEmployeeId:
            lead.assignedEmployeeId ||
            "",

          stage:
            lead.stage || "NEW",

          nextFollowUp:
            toDateTimeLocal(
              lead.nextFollowUp
            ),

          remarks:
            lead.remarks || "",
        });
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load lead"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!id) return;

    setError("");

    if (!form.mobile.trim()) {
      setError(
        "Mobile number is required"
      );

      return;
    }

    try {
      setSaving(true);

      await updateLead(
        id,
        {
          name:
            form.name.trim() ||
            undefined,

          mobile:
            form.mobile.trim(),

          email:
            form.email.trim() ||
            undefined,

          city:
            form.city.trim() ||
            undefined,

          state:
            form.state.trim() ||
            undefined,

          address:
            form.address.trim() ||
            undefined,

          sourceId:
            form.sourceId ||
            undefined,

          assignedEmployeeId:
            form.assignedEmployeeId ||
            undefined,
stage:
  form.stage as
    | "NEW"
    | "WORKING"
    | "FOLLOW_UP"
    | "CONVERTED"
    | "LOST",

          nextFollowUp:
            form.nextFollowUp
              ? new Date(
                  form.nextFollowUp
                ).toISOString()
              : undefined,

          remarks:
            form.remarks.trim() ||
            undefined,
        }
      );

      navigate(
        `/leads/${id}`
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Lead update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading lead...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/leads/${id}`
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Lead
          </h1>

          <p className="text-sm text-slate-500">
            Update lead information
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
        {/* Basic Info */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <UserRoundPen
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Lead Information
              </h2>

              <p className="text-sm text-slate-500">
                Contact and basic details
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Name">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    name:
                      e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Lead name"
              />
            </Field>

            <Field
              label="Mobile"
              required
            >
              <input
                value={form.mobile}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mobile:
                      e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Mobile number"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    email:
                      e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Email address"
              />
            </Field>

            <Field label="City">
              <input
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    city:
                      e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="City"
              />
            </Field>

            <Field label="State">
              <input
                value={form.state}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    state:
                      e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="State"
              />
            </Field>

          <Field label="Stage">
  <select
    value={form.stage}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        stage: e.target.value,
      }))
    }
    className={inputClass}
  >
    <option value="NEW">
      New
    </option>

    <option value="WORKING">
      Working
    </option>

    <option value="FOLLOW_UP">
      Follow Up
    </option>

    <option value="CONVERTED">
      Converted
    </option>

    <option value="LOST">
      Lost
    </option>
  </select>
</Field>
          </div>
        </section>

        {/* Assignment */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Lead Assignment
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Lead Source">
              <select
                value={form.sourceId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sourceId:
                      e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">
                  Select Source
                </option>

                {sources.map(
                  (source) => (
                    <option
                      key={source.id}
                      value={source.id}
                    >
                      {source.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Assigned Employee">
              <select
                value={
                  form.assignedEmployeeId
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    assignedEmployeeId:
                      e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">
                  Unassigned
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
          </div>
        </section>

        {/* Follow-up */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Follow-up & Remarks
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Next Follow-up">
              <input
                type="datetime-local"
                value={
                  form.nextFollowUp
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nextFollowUp:
                      e.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Address">
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    address:
                      e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Complete address"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Remarks">
              <textarea
                rows={4}
                value={form.remarks}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    remarks:
                      e.target.value,
                  }))
                }
                className={inputClass}
                placeholder="Lead remarks..."
              />
            </Field>
          </div>
        </section>

        {/* Actions */}

        <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              navigate(
                `/leads/${id}`
              )
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

function toDateTimeLocal(
  value?: string | null
) {
  if (!value) return "";

  const date = new Date(value);

  const offset =
    date.getTimezoneOffset();

  return new Date(
    date.getTime() -
      offset * 60 * 1000
  )
    .toISOString()
    .slice(0, 16);
}