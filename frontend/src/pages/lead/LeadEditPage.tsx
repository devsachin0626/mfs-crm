import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Save,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

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

import {
  useAppSelector,
} from "../../hooks/redux";

import type {
  LeadStage,
  UpdateLeadRequest,
} from "../../types/lead.types";

export default function LeadEditPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const loggedInEmployee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const roleName = (() => {
    const role =
      loggedInEmployee?.role as unknown;

    if (
      typeof role === "string"
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
  })();

  const canAssign =
    roleName ===
      "ADMIN" ||
    roleName ===
      "HR" ||
    roleName ===
      "TEAM_LEADER";

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
    successMessage,
    setSuccessMessage,
  ] =
    useState("");

  const [
    sources,
    setSources,
  ] =
    useState<any[]>([]);

  const [
    employees,
    setEmployees,
  ] =
    useState<any[]>([]);

  const [
    form,
    setForm,
  ] =
    useState({
      name: "",
      mobile: "",
      email: "",
      city: "",
      state: "",
      address: "",
      sourceId: "",
      assignedEmployeeId:
        "",
      stage:
        "NEW" as LeadStage,
      nextFollowUp: "",
      remarks: "",
    });

  /* ============================
     LOAD DATA
  ============================ */

  useEffect(() => {
    const loadData =
      async () => {
        if (!id) {
          return;
        }

        try {
          setLoading(true);
          setError("");

          const [
            leadResponse,
            sourceResponse,
          ] =
            await Promise.all([
              getLeadById(
                id
              ),

              getLeadSources(),
            ]);

          const employeeResponse =
            canAssign
              ? await getEmployees({
                  page: 1,
                  limit: 100,
                })
              : null;

          const lead =
            leadResponse.lead;

          setSources(
            sourceResponse
              .leadSources ||
              []
          );

          setEmployees(
            employeeResponse
              ?.employees ||
              []
          );

          setForm({
            name:
              lead.name ||
              "",

            mobile:
              lead.mobile ||
              "",

            email:
              lead.email ||
              "",

            city:
              lead.city ||
              "",

            state:
              lead.state ||
              "",

            address:
              lead.address ||
              "",

            sourceId:
              lead.sourceId ||
              "",

            assignedEmployeeId:
              lead.assignedEmployeeId ||
              "",

            stage:
              lead.stage ||
              "NEW",

            nextFollowUp:
              toDateTimeLocal(
                lead.nextFollowUp
              ),

            remarks:
              lead.remarks ||
              "",
          });
        } catch (
          error: any
        ) {
          setError(
            error?.response
              ?.data
              ?.message ||
              "Failed to load lead"
          );
        } finally {
          setLoading(false);
        }
      };

    loadData();
  }, [
    id,
    canAssign,
  ]);

  /* ============================
     CHANGE
  ============================ */

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );
  };

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit =
    async (
      event:
        React.FormEvent
    ) => {
      event.preventDefault();

      if (!id) {
        return;
      }

      try {
        setSaving(true);
        setError("");
        setSuccessMessage(
          ""
        );

        const payload:
          UpdateLeadRequest =
          {
            name:
              form.name.trim() ||
              undefined,

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
              canAssign
                ? form
                    .assignedEmployeeId ||
                  undefined
                : undefined,

            stage:
              form.stage,

            nextFollowUp:
              form.nextFollowUp ||
              undefined,

            remarks:
              form.remarks.trim() ||
              undefined,
          };

        await updateLead(
          id,
          payload
        );

        setSuccessMessage(
          "Lead updated successfully"
        );

        window.setTimeout(
          () => {
            navigate(
              `/leads/${id}`
            );
          },
          700
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            "Failed to update lead"
        );
      } finally {
        setSaving(false);
      }
    };

  /* ============================
     LOADING
  ============================ */

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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              id
                ? `/leads/${id}`
                : "/leads"
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
            Edit Lead
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update lead information
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {
            successMessage
          }
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Name">
            <input
              value={
                form.name
              }
              onChange={(e) =>
                handleChange(
                  "name",
                  e.target
                    .value
                )
              }
              className={
                inputClass
              }
              placeholder="Client name"
            />
          </Field>

          <Field
            label="Mobile"
            required
          >
            <input
              value={
                form.mobile
              }
              readOnly
              className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
              placeholder="Mobile number"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Mobile number cannot be changed after lead creation.
            </p>
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={
                form.email
              }
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target
                    .value
                )
              }
              className={
                inputClass
              }
              placeholder="Email"
            />
          </Field>

          <Field label="City">
            <input
              value={
                form.city
              }
              onChange={(e) =>
                handleChange(
                  "city",
                  e.target
                    .value
                )
              }
              className={
                inputClass
              }
              placeholder="City"
            />
          </Field>

          <Field label="State">
            <input
              value={
                form.state
              }
              onChange={(e) =>
                handleChange(
                  "state",
                  e.target
                    .value
                )
              }
              className={
                inputClass
              }
              placeholder="State"
            />
          </Field>

          <Field label="Source">
            <select
              value={
                form.sourceId
              }
              onChange={(e) =>
                handleChange(
                  "sourceId",
                  e.target
                    .value
                )
              }
              className={
                inputClass
              }
            >
              <option value="">
                Select Source
              </option>

              {sources.map(
                (source) => (
                  <option
                    key={
                      source.id
                    }
                    value={
                      source.id
                    }
                  >
                    {
                      source.name
                    }
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Stage">
            <select
              value={
                form.stage
              }
              onChange={(e) =>
                handleChange(
                  "stage",
                  e.target
                    .value
                )
              }
              className={
                inputClass
              }
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

          <Field label="Next Follow-up">
            <input
              type="datetime-local"
              value={
                form.nextFollowUp
              }
              onChange={(e) =>
                handleChange(
                  "nextFollowUp",
                  e.target
                    .value
                )
              }
              className={
                inputClass
              }
            />
          </Field>

          {canAssign ? (
            <Field label="Assigned Employee">
              <select
                value={
                  form.assignedEmployeeId
                }
                onChange={(e) =>
                  handleChange(
                    "assignedEmployeeId",
                    e.target
                      .value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Unassigned
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
                      }
                      {" - "}
                      {
                        employee.employeeCode
                      }
                    </option>
                  )
                )}
              </select>
            </Field>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Assigned Employee
              </p>

              <p className="mt-2 font-semibold text-blue-900">
                {loggedInEmployee?.name ||
                  "Self"}
              </p>

              <p className="mt-1 text-xs text-blue-600">
                Assignment cannot be changed.
              </p>
            </div>
          )}

          <div className="md:col-span-2">
            <Field label="Address">
              <textarea
                rows={3}
                value={
                  form.address
                }
                onChange={(e) =>
                  handleChange(
                    "address",
                    e.target
                      .value
                  )
                }
                className={
                  inputClass
                }
                placeholder="Address"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Remarks">
              <textarea
                rows={4}
                value={
                  form.remarks
                }
                onChange={(e) =>
                  handleChange(
                    "remarks",
                    e.target
                      .value
                  )
                }
                className={
                  inputClass
                }
                placeholder="Lead remarks"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() =>
              navigate(
                id
                  ? `/leads/${id}`
                  : "/leads"
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
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
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

/* ============================
   DATETIME
============================ */

function toDateTimeLocal(
  value?:
    | string
    | null
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const pad = (
    number: number
  ) =>
    String(number).padStart(
      2,
      "0"
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
}
