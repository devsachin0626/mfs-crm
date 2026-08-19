import { useEffect, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Save,
  UserRound,
} from "lucide-react";

import {
  getEmployeeById,
  updateEmployee,
  getBranches,
  getRoles,
  getEmployees,
} from "../../services/employee.service";

import type {
  BranchOption,
  RoleOption,
  Employee,
} from "../../types/employee.types";

export default function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [branches, setBranches] =
    useState<BranchOption[]>([]);

  const [roles, setRoles] =
    useState<RoleOption[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    joiningDate: "",
    salary: "",
    branchId: "",
    roleId: "",
    reportingManagerId: "",
    status: "ACTIVE",
    isActive: true,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const [
          employeeResponse,
          branchResponse,
          roleResponse,
          employeeListResponse,
        ] = await Promise.all([
          getEmployeeById(id),
          getBranches(),
          getRoles(),
          getEmployees({
            page: 1,
            limit: 100,
          }),
        ]);

        const employee =
          employeeResponse.employee;

        setBranches(
          branchResponse.branches || []
        );

        setRoles(
          roleResponse.roles || []
        );

        setEmployees(
          employeeListResponse.employees || []
        );

        setForm({
          name: employee.name || "",

          mobile:
            employee.mobile || "",

          email:
            employee.email || "",

          gender:
            employee.gender || "",

          dateOfBirth:
            employee.dateOfBirth
              ? String(
                  employee.dateOfBirth
                ).slice(0, 10)
              : "",

          address:
            employee.address || "",

          joiningDate:
            employee.joiningDate
              ? String(
                  employee.joiningDate
                ).slice(0, 10)
              : "",

          salary:
            employee.salary
              ? String(employee.salary)
              : "",

          branchId:
            employee.branch?.id || "",

          roleId:
            employee.role?.id || "",

          reportingManagerId:
            employee.reportingManager
              ?.id || "",

          status:
            employee.status || "ACTIVE",

          isActive:
            employee.isActive ?? true,
        });
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load employee"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (
    e: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!id) return;

    setError("");

    if (
      !form.name.trim() ||
      !form.mobile.trim() ||
      !form.branchId ||
      !form.roleId
    ) {
      setError(
        "Name, Mobile, Branch and Role are required"
      );

      return;
    }

    try {
      setSaving(true);

      await updateEmployee(id, {
        name: form.name.trim(),

        mobile:
          form.mobile.trim(),

        email:
          form.email.trim() ||
          undefined,

        gender:
          form.gender ||
          undefined,

        dateOfBirth:
          form.dateOfBirth ||
          undefined,

        address:
          form.address.trim() ||
          undefined,

        joiningDate:
          form.joiningDate ||
          undefined,

        salary:
          form.salary
            ? Number(form.salary)
            : undefined,

        branchId:
          form.branchId,

        roleId:
          form.roleId,

        reportingManagerId:
          form.reportingManagerId ||
          undefined,

        status:
          form.status,

        isActive:
          form.isActive,
      });

      navigate(
        `/employees/${id}`
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Employee update failed"
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
            Loading employee...
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
              `/employees/${id}`
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Employee
          </h1>

          <p className="text-sm text-slate-500">
            Update employee information
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
        {/* Personal Information */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <UserRound size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Personal Information
              </h2>

              <p className="text-sm text-slate-500">
                Basic employee details
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Full Name"
              required
            >
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="Mobile Number"
              required
            >
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Gender">
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Gender
                </option>

                <option value="MALE">
                  Male
                </option>

                <option value="FEMALE">
                  Female
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                name="dateOfBirth"
                value={
                  form.dateOfBirth
                }
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Address">
              <textarea
                name="address"
                rows={3}
                value={form.address}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Employment */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Employment Information
            </h2>

            <p className="text-sm text-slate-500">
              Role, branch and reporting
              structure
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Branch"
              required
            >
              <select
                name="branchId"
                value={form.branchId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Branch
                </option>

                {branches.map(
                  (branch) => (
                    <option
                      key={branch.id}
                      value={branch.id}
                    >
                      {branch.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field
              label="Role"
              required
            >
              <select
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Role
                </option>

                {roles.map(
                  (role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  )
                )}
              </select>
            </Field>

            <Field label="Reporting Manager">
              <select
                name="reportingManagerId"
                value={
                  form.reportingManagerId
                }
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  No Reporting Manager
                </option>

                {employees
                  .filter(
                    (employee) =>
                      employee.id !== id
                  )
                  .map(
                    (employee) => (
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

            <Field label="Joining Date">
              <input
                type="date"
                name="joiningDate"
                value={
                  form.joiningDate
                }
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Monthly Salary">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>

            <Field label="Status">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

                <option value="RESIGNED">
                  Resigned
                </option>

                <option value="TERMINATED">
                  Terminated
                </option>
              </select>
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
                `/employees/${id}`
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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