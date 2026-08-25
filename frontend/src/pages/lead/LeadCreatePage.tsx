import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useAppSelector,
} from "../../hooks/redux";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Save,
  UserPlus,
} from "lucide-react";

import {
  createLead,
} from "../../services/lead.service";

import {
  getEmployees,
} from "../../services/employee.service";

import {
  getLeadSources,
} from "../../services/leadSource.service";

import type {
  Employee,
} from "../../types/employee.types";

import type {
  LeadSource,
} from "../../types/lead.types";

export default function LeadCreatePage() {
  const navigate = useNavigate();

  const loggedInEmployee =
  useAppSelector(
    (state) =>
      state.auth.employee
  );

const roleName = (() => {
  const role = loggedInEmployee?.role as unknown;

  if (typeof role === "string") {
    return role;
  }

  if (
    role &&
    typeof role === "object" &&
    "name" in role
  ) {
    return String(
      (role as { name: string }).name
    );
  }

  return "";
})();
const isEmployee =
  roleName === "EMPLOYEE";

const canAssign =
  roleName === "ADMIN" ||
  roleName === "HR" ||
  roleName === "TEAM_LEADER";

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [sources, setSources] =
    useState<LeadSource[]>([]);

  const [loadingOptions, setLoadingOptions] =
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
      remarks: "",
    });

 useEffect(() => {
  const loadOptions =
    async () => {
      try {
        setLoadingOptions(true);
        setError("");

        const sourceResponse =
          await getLeadSources();

        setSources(
          sourceResponse.leadSources ||
            []
        );

        if (canAssign) {
          const employeeResponse =
            await getEmployees({
              page: 1,
              limit: 100,
            });

          setEmployees(
            employeeResponse.employees ||
              []
          );
        } else {
          setEmployees([]);
        }
      } catch (error: any) {
        setError(
          error?.response?.data
            ?.message ||
            "Failed to load lead form options"
        );
      } finally {
        setLoadingOptions(false);
      }
    };

  loadOptions();
}, [canAssign]);

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!form.mobile.trim()) {
      setError(
        "Mobile number is required"
      );
      return;
    }

    try {
      setSaving(true);

      await createLead({
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
  canAssign
    ? form.assignedEmployeeId ||
      undefined
    : undefined,

        remarks:
          form.remarks.trim() ||
          undefined,
      });

      navigate("/leads");
    } catch (error: any) {
      setError(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Lead creation failed"
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
            navigate("/leads")
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create Lead
          </h1>

          <p className="text-sm text-slate-500">
            Add a new sales lead
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loadingOptions ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading form...
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <UserPlus size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Lead Information
                </h2>

                <p className="text-sm text-slate-500">
                  Contact and basic lead details
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
                  placeholder="Lead name"
                  className={inputClass}
                />
              </Field>
<Field
  label="Mobile"
  required
>
  <input
    value={form.mobile}
    readOnly={
      isEmployee
    }
    onChange={(e) => {
      if (isEmployee) {
        return;
      }

      setForm((prev) => ({
        ...prev,
        mobile:
          e.target.value,
      }));
    }}
    className={
      isEmployee
        ? `${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`
        : inputClass
    }
    placeholder="Mobile number"
  />

  {isEmployee && (
    <p className="mt-1.5 text-xs text-slate-500">
      Mobile number cannot be changed.
    </p>
  )}
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
                  placeholder="Email address"
                  className={inputClass}
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
                  placeholder="City"
                  className={inputClass}
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
                  placeholder="State"
                  className={inputClass}
                />
              </Field>

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

              {canAssign ? (
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
) : (
  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
    <p className="text-sm font-medium text-blue-800">
      Lead Assignment
    </p>

    <p className="mt-1 text-xs text-blue-600">
      This lead will automatically be assigned to you.
    </p>
  </div>
)}
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
                  placeholder="Complete address"
                  className={inputClass}
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
                  placeholder="Initial lead remarks..."
                  className={inputClass}
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
                navigate("/leads")
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
                ? "Creating..."
                : "Create Lead"}
            </button>
          </div>
        </form>
      )}
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