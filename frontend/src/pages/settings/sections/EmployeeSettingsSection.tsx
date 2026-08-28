import {
  Check,
  KeyRound,
  Loader2,
  
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  UserRoundCog,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  deactivateEmployee,
  getAllEmployees,
  getBranches,
  getEmployeeById,
  getRoles,
  resetEmployeePassword,
  restoreEmployee,
  updateEmployee,
} from "../../../services/employee.service";

import type {
  BranchOption,
  Employee,
  EmployeeDetails,
  RoleOption,
  UpdateEmployeePayload,
} from "../../../types/employee.types";

import {
  SettingsCard,
  SettingsSectionHeader,
  SettingsStatusBadge,
} from "../SettingsLayout";

/* ============================
   TAB
============================ */

type EmployeeTab =
  | "BASIC"
  | "JOB"
  | "ACCOUNT"
  | "SECURITY";

/* ============================
   FORM
============================ */

type EmployeeForm = {
  name: string;
  mobile: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  address: string;

  joiningDate: string;
  salary: string;
  branchId: string;
  roleId: string;
  reportingManagerId: string;

  status: string;
  isActive: boolean;
};

/* ============================
   INITIAL FORM
============================ */

const INITIAL_FORM: EmployeeForm = {
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
};

/* ============================
   PAGE
============================ */

export default function EmployeeSettingsSection() {
  const [
    employees,
    setEmployees,
  ] =
    useState<Employee[]>([]);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] =
    useState<EmployeeDetails | null>(
      null
    );

  const [
    branches,
    setBranches,
  ] =
    useState<BranchOption[]>([]);

  const [
    roles,
    setRoles,
  ] =
    useState<RoleOption[]>([]);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<EmployeeTab>(
      "BASIC"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    detailsLoading,
    setDetailsLoading,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<EmployeeForm>(
      INITIAL_FORM
    );

  /* ============================
     PASSWORD
  ============================ */

  const [
    showPasswordModal,
    setShowPasswordModal,
  ] =
    useState(false);

  const [
    newPassword,
    setNewPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  /* ============================
     LOAD MASTER DATA
  ============================ */

  const loadMasterData =
    async () => {
      try {
        const [
          branchResponse,
          roleResponse,
        ] =
          await Promise.all([
            getBranches(),
            getRoles(),
          ]);

        setBranches(
          Array.isArray(
            branchResponse
              ?.branches
          )
            ? branchResponse
                .branches
            : []
        );

        setRoles(
          Array.isArray(
            roleResponse
              ?.roles
          )
            ? roleResponse
                .roles
            : []
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      }
    };

  /* ============================
     LOAD EMPLOYEES
  ============================ */

  const loadEmployees =
    async () => {
      try {
        setLoading(true);

        setError(null);

        const response =
          await getAllEmployees();

        const rows =
          response.employees || [];

        setEmployees(
          rows
        );

        if (
          rows.length > 0 &&
          !selectedEmployee
        ) {
          await loadEmployeeDetails(
            rows[0].id
          );
        }
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================
     LOAD DETAIL
  ============================ */

  const loadEmployeeDetails =
    async (
      id: string
    ) => {
      try {
        setDetailsLoading(
          true
        );

        setError(null);

        const response =
          await getEmployeeById(
            id
          );

        const employee =
          response.employee;

        setSelectedEmployee(
          employee
        );

        setForm({
          name:
            employee.name ||
            "",

          mobile:
            employee.mobile ||
            "",

          email:
            employee.email ||
            "",

          gender:
            employee.gender ||
            "",

          dateOfBirth:
            toDateInput(
              employee.dateOfBirth
            ),

          address:
            employee.address ||
            "",

          joiningDate:
            toDateInput(
              employee.joiningDate
            ),

          salary:
            employee.salary !==
              null &&
            employee.salary !==
              undefined
              ? String(
                  employee.salary
                )
              : "",

          branchId:
            employee.branch
              ?.id ||
            "",

          roleId:
            employee.role
              ?.id ||
            "",

          reportingManagerId:
            employee
              .reportingManager
              ?.id ||
            "",

          status:
            employee.status ||
            "ACTIVE",

          isActive:
            employee.isActive,
        });
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setDetailsLoading(
          false
        );
      }
    };

  /* ============================
     INIT
  ============================ */

  useEffect(() => {
    void Promise.all([
      loadMasterData(),
      loadEmployees(),
    ]);
  }, []);

  /* ============================
     FILTER
  ============================ */

  const filteredEmployees =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return employees;
      }

      return employees.filter(
        (employee) =>
          employee.name
            .toLowerCase()
            .includes(
              value
            ) ||
          employee.employeeCode
            .toLowerCase()
            .includes(
              value
            ) ||
          employee.mobile
            .toLowerCase()
            .includes(
              value
            ) ||
          (
            employee.email ||
            ""
          )
            .toLowerCase()
            .includes(
              value
            )
      );
    }, [
      employees,
      search,
    ]);

  /* ============================
     FORM CHANGE
  ============================ */

  const setField =
    (
      field:
        keyof EmployeeForm,
      value:
        string | boolean
    ) => {
      setForm(
        (previous) => ({
          ...previous,

          [field]:
            value,
        })
      );
    };

  /* ============================
     SAVE EMPLOYEE
  ============================ */

  const handleSave =
    async () => {
      if (
        !selectedEmployee
      ) {
        return;
      }

      if (
        !form.name.trim()
      ) {
        setError(
          "Employee name is required."
        );

        return;
      }

      if (
        !form.mobile.trim()
      ) {
        setError(
          "Mobile number is required."
        );

        return;
      }

      if (
        !form.branchId
      ) {
        setError(
          "Branch is required."
        );

        return;
      }

      if (
        !form.roleId
      ) {
        setError(
          "Role is required."
        );

        return;
      }

      const salary =
        form.salary.trim()
          ? Number(
              form.salary
            )
          : undefined;

      if (
        salary !==
          undefined &&
        Number.isNaN(
          salary
        )
      ) {
        setError(
          "Salary must be a valid number."
        );

        return;
      }

      try {
        setSaving(true);

        setError(null);

        setSuccess(null);

        const payload:
          UpdateEmployeePayload = {
          name:
            form.name.trim(),

          mobile:
            form.mobile.trim(),

          email:
            form.email
              .trim() ||
            undefined,

          gender:
            form.gender ||
            undefined,

          dateOfBirth:
            form.dateOfBirth ||
            undefined,

          address:
            form.address
              .trim() ||
            undefined,

          joiningDate:
            form.joiningDate ||
            undefined,

          salary,

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
        };

        await updateEmployee(
          selectedEmployee.id,
          payload
        );

        setSuccess(
          "Employee updated successfully."
        );

        await loadEmployeeDetails(
          selectedEmployee.id
        );

        await loadEmployees();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setSaving(false);
      }
    };

  /* ============================
     ACTIVE / INACTIVE
  ============================ */

  const handleAccountToggle =
    async () => {
      if (
        !selectedEmployee
      ) {
        return;
      }

      const text =
        selectedEmployee.isActive
          ? "Deactivate this employee account?"
          : "Restore this employee account?";

      if (
        !window.confirm(
          text
        )
      ) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        setError(null);

        setSuccess(null);

        if (
          selectedEmployee.isActive
        ) {
          await deactivateEmployee(
            selectedEmployee.id
          );

          setSuccess(
            "Employee deactivated successfully."
          );
        } else {
          await restoreEmployee(
            selectedEmployee.id
          );

          setSuccess(
            "Employee restored successfully."
          );
        }

        await loadEmployeeDetails(
          selectedEmployee.id
        );

        await loadEmployees();
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* ============================
     PASSWORD RESET
  ============================ */

  const handlePasswordReset =
    async () => {
      if (
        !selectedEmployee
      ) {
        return;
      }

      if (
        newPassword.length <
        6
      ) {
        setError(
          "Password must be at least 6 characters."
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Password and confirm password do not match."
        );

        return;
      }

      try {
        setActionLoading(
          true
        );

        setError(null);

        setSuccess(null);

        await resetEmployeePassword(
          selectedEmployee.id,
          newPassword
        );

        setSuccess(
          "Employee password reset successfully."
        );

        setNewPassword(
          ""
        );

        setConfirmPassword(
          ""
        );

        setShowPasswordModal(
          false
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <SettingsSectionHeader
        title="Employee Settings"
        description="Central employee control panel for profile, job information, reporting structure, account status and password reset."
        action={
          <button
            type="button"
            onClick={() =>
              void loadEmployees()
            }
            disabled={
              loading
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        }
      />

      {/* ============================
          MESSAGES
      ============================ */}

      {error && (
        <Message
          type="ERROR"
          message={
            error
          }
          onClose={() =>
            setError(
              null
            )
          }
        />
      )}

      {success && (
        <Message
          type="SUCCESS"
          message={
            success
          }
          onClose={() =>
            setSuccess(
              null
            )
          }
        />
      )}

      {/* ============================
          MAIN
      ============================ */}

      <div className="grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)]">
        {/* ============================
            EMPLOYEE LIST
        ============================ */}

        <SettingsCard>
          <div className="border-b border-slate-100 pb-4">
            <p className="font-semibold text-slate-900">
              Employees
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {
                employees.length
              }{" "}
              employees
            </p>

            <div className="relative mt-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search employee..."
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div className="mt-3 max-h-162.5 space-y-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex min-h-48 items-center justify-center">
                <Loader2
                  size={24}
                  className="animate-spin text-blue-700"
                />
              </div>
            ) : filteredEmployees.length ===
              0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No employees found.
              </div>
            ) : (
              filteredEmployees.map(
                (
                  employee
                ) => {
                  const selected =
                    selectedEmployee
                      ?.id ===
                    employee.id;

                  return (
                    <button
                      key={
                        employee.id
                      }
                      type="button"
                      onClick={() =>
                        void loadEmployeeDetails(
                          employee.id
                        )
                      }
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-blue-200 bg-blue-50"
                          : "border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            selected
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {getInitials(
                            employee.name
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {
                                employee.name
                              }
                            </p>

                            <span
                              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                                employee.isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-300"
                              }`}
                            />
                          </div>

                          <p className="mt-0.5 text-xs font-medium text-blue-700">
                            {
                              employee.employeeCode
                            }
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {
                              employee.role
                            }
                            {" · "}
                            {
                              employee.branch
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </SettingsCard>

        {/* ============================
            DETAIL
        ============================ */}

        <div className="min-w-0">
          {detailsLoading ? (
            <SettingsCard>
              <div className="flex min-h-125 items-center justify-center">
                <Loader2
                  size={28}
                  className="animate-spin text-blue-700"
                />
              </div>
            </SettingsCard>
          ) : !selectedEmployee ? (
            <SettingsCard>
              <div className="flex min-h-125 flex-col items-center justify-center text-center">
                <UserRoundCog
                  size={40}
                  className="text-slate-300"
                />

                <p className="mt-4 font-semibold text-slate-700">
                  Select an employee
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Choose an employee from
                  the list to manage account
                  settings.
                </p>
              </div>
            </SettingsCard>
          ) : (
            <div className="space-y-5">
              {/* PROFILE HEADER */}

              <SettingsCard>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700">
                      {getInitials(
                        selectedEmployee.name
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {
                            selectedEmployee.name
                          }
                        </h3>

                        <SettingsStatusBadge
                          active={
                            selectedEmployee.isActive
                          }
                        />
                      </div>

                      <p className="mt-1 text-sm font-medium text-blue-700">
                        {
                          selectedEmployee.employeeCode
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {
                          selectedEmployee.role.name
                        }
                        {" · "}
                        {
                          selectedEmployee.branch.name
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleSave
                    }
                    disabled={
                      saving
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Save
                        size={16}
                      />
                    )}

                    Save Changes
                  </button>
                </div>
              </SettingsCard>

              {/* TABS */}

              <SettingsCard>
                <div className="flex gap-1 overflow-x-auto border-b border-slate-100 pb-3">
                  <TabButton
                    active={
                      activeTab ===
                      "BASIC"
                    }
                    label="Basic Details"
                    onClick={() =>
                      setActiveTab(
                        "BASIC"
                      )
                    }
                  />

                  <TabButton
                    active={
                      activeTab ===
                      "JOB"
                    }
                    label="Job Details"
                    onClick={() =>
                      setActiveTab(
                        "JOB"
                      )
                    }
                  />

                  <TabButton
                    active={
                      activeTab ===
                      "ACCOUNT"
                    }
                    label="Account"
                    onClick={() =>
                      setActiveTab(
                        "ACCOUNT"
                      )
                    }
                  />

                  <TabButton
                    active={
                      activeTab ===
                      "SECURITY"
                    }
                    label="Security"
                    onClick={() =>
                      setActiveTab(
                        "SECURITY"
                      )
                    }
                  />
                </div>

                {/* BASIC */}

                {activeTab ===
                  "BASIC" && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Field label="Employee Code">
                      <input
                        type="text"
                        value={
                          selectedEmployee.employeeCode
                        }
                        disabled
                        className={`${inputClass} bg-slate-50 text-slate-500`}
                      />
                    </Field>

                    <Field label="Full Name">
                      <input
                        type="text"
                        value={
                          form.name
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "name",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field label="Mobile">
                      <input
                        type="text"
                        value={
                          form.mobile
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "mobile",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        type="email"
                        value={
                          form.email
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "email",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field label="Gender">
                      <select
                        value={
                          form.gender
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "gender",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
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
                        value={
                          form.dateOfBirth
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "dateOfBirth",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Address">
                        <textarea
                          rows={4}
                          value={
                            form.address
                          }
                          onChange={(
                            event
                          ) =>
                            setField(
                              "address",
                              event.target
                                .value
                            )
                          }
                          className={`${inputClass} resize-none`}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* JOB */}

                {activeTab ===
                  "JOB" && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Field label="Joining Date">
                      <input
                        type="date"
                        value={
                          form.joiningDate
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "joiningDate",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field label="Salary">
                      <input
                        type="number"
                        min="0"
                        value={
                          form.salary
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "salary",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                    <Field label="Branch">
                      <select
                        value={
                          form.branchId
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "branchId",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      >
                        <option value="">
                          Select Branch
                        </option>

                        {branches.map(
                          (
                            branch
                          ) => (
                            <option
                              key={
                                branch.id
                              }
                              value={
                                branch.id
                              }
                            >
                              {
                                branch.name
                              }
                              {" - "}
                              {
                                branch.branchCode
                              }
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field label="Role">
                      <select
                        value={
                          form.roleId
                        }
                        onChange={(
                          event
                        ) =>
                          setField(
                            "roleId",
                            event.target
                              .value
                          )
                        }
                        className={
                          inputClass
                        }
                      >
                        <option value="">
                          Select Role
                        </option>

                        {roles.map(
                          (
                            role
                          ) => (
                            <option
                              key={
                                role.id
                              }
                              value={
                                role.id
                              }
                            >
                              {
                                role.name
                              }
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <div className="md:col-span-2">
                      <Field label="Reporting Manager">
                        <select
                          value={
                            form.reportingManagerId
                          }
                          onChange={(
                            event
                          ) =>
                            setField(
                              "reportingManagerId",
                              event.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        >
                          <option value="">
                            No Reporting Manager
                          </option>

                          {employees
                            .filter(
                              (
                                employee
                              ) =>
                                employee.id !==
                                selectedEmployee.id
                            )
                            .map(
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
                    </div>
                  </div>
                )}

                {/* ACCOUNT */}

                {activeTab ===
                  "ACCOUNT" && (
                  <div className="mt-5 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Employee Status">
                        <select
                          value={
                            form.status
                          }
                          onChange={(
                            event
                          ) =>
                            setField(
                              "status",
                              event.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        >
                          <option value="ACTIVE">
                            Active
                          </option>

                          <option value="INACTIVE">
                            Inactive
                          </option>

                          <option value="SUSPENDED">
                            Suspended
                          </option>
                        </select>
                      </Field>

                      <Field label="Login / Account">
                        <div className="flex h-11 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3.5">
                          <span className="text-sm font-medium text-slate-700">
                            {selectedEmployee.isActive
                              ? "Account Active"
                              : "Account Inactive"}
                          </span>

                          <SettingsStatusBadge
                            active={
                              selectedEmployee.isActive
                            }
                          />
                        </div>
                      </Field>
                    </div>

                    <div
                      className={`rounded-xl border p-4 ${
                        selectedEmployee.isActive
                          ? "border-red-200 bg-red-50"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          selectedEmployee.isActive
                            ? "text-red-800"
                            : "text-emerald-800"
                        }`}
                      >
                        {selectedEmployee.isActive
                          ? "Deactivate Employee"
                          : "Restore Employee"}
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          selectedEmployee.isActive
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {selectedEmployee.isActive
                          ? "Employee login and active usage can be disabled without deleting historical CRM data."
                          : "Restore the employee account and allow active CRM usage again."}
                      </p>

                      <button
                        type="button"
                        onClick={
                          handleAccountToggle
                        }
                        disabled={
                          actionLoading
                        }
                        className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
                          selectedEmployee.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-700 hover:bg-emerald-800"
                        }`}
                      >
                        {actionLoading && (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        )}

                        {selectedEmployee.isActive
                          ? "Deactivate Account"
                          : "Restore Account"}
                      </button>
                    </div>
                  </div>
                )}

                {/* SECURITY */}

                {activeTab ===
                  "SECURITY" && (
                  <div className="mt-5">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                          <ShieldCheck
                            size={20}
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            Password Security
                          </p>

                          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                            Existing password cannot
                            be viewed. Admin can securely
                            reset the employee password
                            when required.
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordModal(
                                true
                              )
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                          >
                            <KeyRound
                              size={16}
                            />

                            Reset Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SettingsCard>
            </div>
          )}
        </div>
      </div>

      {/* ============================
          PASSWORD MODAL
      ============================ */}

      {showPasswordModal &&
        selectedEmployee && (
        <Modal
          title="Reset Employee Password"
          description={`Set a new login password for ${selectedEmployee.name}.`}
          onClose={() => {
            if (
              actionLoading
            ) {
              return;
            }

            setShowPasswordModal(
              false
            );

            setNewPassword(
              ""
            );

            setConfirmPassword(
              ""
            );
          }}
        >
          <div className="space-y-4">
            <Field label="New Password">
              <input
                type="password"
                value={
                  newPassword
                }
                onChange={(
                  event
                ) =>
                  setNewPassword(
                    event.target
                      .value
                  )
                }
                placeholder="Enter new password"
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Confirm Password">
              <input
                type="password"
                value={
                  confirmPassword
                }
                onChange={(
                  event
                ) =>
                  setConfirmPassword(
                    event.target
                      .value
                  )
                }
                placeholder="Confirm new password"
                className={
                  inputClass
                }
              />
            </Field>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
              Current password is never
              shown. The new password will
              replace the old login password.
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() =>
                  setShowPasswordModal(
                    false
                  )
                }
                disabled={
                  actionLoading
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handlePasswordReset
                }
                disabled={
                  actionLoading
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <KeyRound
                    size={16}
                  />
                )}

                Reset Password
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================
   TAB
============================ */

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

/* ============================
   FIELD
============================ */

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}

/* ============================
   MESSAGE
============================ */

function Message({
  type,
  message,
  onClose,
}: {
  type:
    | "SUCCESS"
    | "ERROR";
  message: string;
  onClose: () => void;
}) {
  const success =
    type === "SUCCESS";

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <div className="flex items-center gap-2">
        {success && (
          <Check
            size={16}
          />
        )}

        <span>
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={
          onClose
        }
      >
        <X
          size={16}
        />
      </button>
    </div>
  );
}

/* ============================
   MODAL
============================ */

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children:
    React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {title}
            </h3>

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {
                  description
                }
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================
   DATE
============================ */

function toDateInput(
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

  return date
    .toISOString()
    .slice(0, 10);
}

/* ============================
   INITIALS
============================ */

function getInitials(
  name: string
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
          ?.toUpperCase() ||
        ""
    )
    .join("");
}

/* ============================
   ERROR
============================ */

function getErrorMessage(
  error: unknown
) {
  if (
    typeof error ===
      "object" &&
    error !== null
  ) {
    const apiError =
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

    return (
      apiError.response
        ?.data?.message ||
      apiError.message ||
      "Something went wrong"
    );
  }

  return "Something went wrong";
}

/* ============================
   INPUT
============================ */

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";