import {
  useEffect,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";

import {
  useAppDispatch,
  useAppSelector,
} from "../../hooks/redux";

import {
  fetchEmployeeDetails,
  clearEmployeeDetails,
} from "../../store/slices/employeeDetailsSlice";

import {
  deactivateEmployee,
  restoreEmployee,
} from "../../services/employee.service";

import EmployeeAttendanceTab from "../../features/attendance/EmployeeAttendanceTab";
import EmployeeLeaveTab from "../../features/leave/EmployeeLeaveTab";
import EmployeeTargetTab from "../../features/target/EmployeeTargetTab";
import EmployeePayrollTab from "../../features/payroll/EmployeePayrollTab";

export default function EmployeeDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const [statusUpdating, setStatusUpdating] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("Overview");

  const {
    employee,
    loading,
    error,
  } = useAppSelector(
    (state) =>
      state.employeeDetails
  );

  useEffect(() => {
    if (id) {
      dispatch(
        fetchEmployeeDetails(id)
      );
    }

    return () => {
      dispatch(
        clearEmployeeDetails()
      );
    };
  }, [dispatch, id]);

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

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-700">
          Failed to load employee
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Employee not found
      </div>
    );
  }

  const initials =
    employee.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const handleEmployeeStatus =
    async () => {
      if (!employee) return;

      const action =
        employee.isActive
          ? "deactivate"
          : "restore";

      const confirmed =
        window.confirm(
          employee.isActive
            ? `Are you sure you want to deactivate ${employee.name}?`
            : `Are you sure you want to restore ${employee.name}?`
        );

      if (!confirmed) return;

      try {
        setStatusUpdating(true);

        if (employee.isActive) {
          await deactivateEmployee(
            employee.id
          );
        } else {
          await restoreEmployee(
            employee.id
          );
        }

        await dispatch(
          fetchEmployeeDetails(
            employee.id
          )
        );
      } catch (error: any) {
        alert(
          error?.response?.data
            ?.message ||
            `Failed to ${action} employee`
        );
      } finally {
        setStatusUpdating(false);
      }
    };

  const tabs = [
    "Overview",
    "Attendance",
    "Targets",
    "Payroll",
    "Leaves",
    "Activity",
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/employees"
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
              Employee Details
            </h1>

            <p className="text-sm text-slate-500">
              {
                employee.employeeCode
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={
              handleEmployeeStatus
            }
            disabled={
              statusUpdating
            }
            className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 ${
              employee.isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {statusUpdating
              ? "Updating..."
              : employee.isActive
              ? "Deactivate"
              : "Restore"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/employees/edit/${employee.id}`
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
          >
            <Pencil
              size={17}
            />
            Edit Employee
          </button>
        </div>
      </div>

      {/* Profile Header */}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-700 text-2xl font-bold text-white">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  {
                    employee.name
                  }
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    employee.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {employee.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-blue-700">
                {
                  employee.role
                    .name
                }
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Phone
                    size={15}
                  />

                  {
                    employee.mobile
                  }
                </div>

                <div className="flex items-center gap-2">
                  <Mail
                    size={15}
                  />

                  {employee.email ||
                    "-"}
                </div>

                <div className="flex items-center gap-2">
                  <Building2
                    size={15}
                  />

                  {
                    employee.branch
                      .name
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              label="Employee Code"
              value={
                employee.employeeCode
              }
            />

            <InfoItem
              label="Role"
              value={
                employee.role.name
              }
            />

            <InfoItem
              label="Branch"
              value={
                employee.branch.name
              }
            />

            <InfoItem
              label="Status"
              value={
                employee.status
              }
            />
          </div>
        </div>

        {/* Employment Summary */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Employment Summary
          </h3>

          <div className="mt-5 space-y-5">
            <SummaryItem
              icon={
                <UserRound
                  size={18}
                />
              }
              label="Reporting Manager"
              value={
                employee
                  .reportingManager
                  ?.name ||
                "Not Assigned"
              }
            />

            <SummaryItem
              icon={
                <CalendarDays
                  size={18}
                />
              }
              label="Joining Date"
              value={
                employee.joiningDate
                  ? new Date(
                      employee.joiningDate
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "-"
              }
            />

            <SummaryItem
              icon={
                <BriefcaseBusiness
                  size={18}
                />
              }
              label="Branch Code"
              value={
                employee.branch
                  .branchCode ||
                "-"
              }
            />
          </div>
        </div>
      </div>

      {/* Tabs */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Tab Navigation */}

        <div className="flex overflow-x-auto border-b border-slate-200 px-4">
          {tabs.map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab
                  )
                }
                className={`whitespace-nowrap border-b-2 px-5 py-4 text-sm font-medium transition ${
                  activeTab ===
                  tab
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Overview Tab */}

        {activeTab ===
          "Overview" && (
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            {/* Personal */}

            <div>
              <h3 className="mb-5 font-semibold text-slate-900">
                Personal
                Information
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Full Name"
                  value={
                    employee.name
                  }
                />

                <InfoItem
                  label="Mobile"
                  value={
                    employee.mobile
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    employee.email ||
                    "-"
                  }
                />

                <InfoItem
                  label="Gender"
                  value={
                    employee.gender ||
                    "-"
                  }
                />

                <InfoItem
                  label="Date of Birth"
                  value={
                    employee.dateOfBirth
                      ? new Date(
                          employee.dateOfBirth
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"
                  }
                />

                <InfoItem
                  label="Address"
                  value={
                    employee.address ||
                    "-"
                  }
                />
              </div>
            </div>

            {/* Employment */}

            <div>
              <h3 className="mb-5 font-semibold text-slate-900">
                Employment
                Information
              </h3>

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Employee Code"
                  value={
                    employee.employeeCode
                  }
                />

                <InfoItem
                  label="Role"
                  value={
                    employee.role
                      .name
                  }
                />

                <InfoItem
                  label="Branch"
                  value={
                    employee.branch
                      .name
                  }
                />

                <InfoItem
                  label="Reporting Manager"
                  value={
                    employee
                      .reportingManager
                      ?.name || "-"
                  }
                />

                <InfoItem
                  label="Joining Date"
                  value={
                    employee.joiningDate
                      ? new Date(
                          employee.joiningDate
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"
                  }
                />

                <InfoItem
                  label="Salary"
                  value={
                    employee.salary
                      ? `₹${Number(
                          employee.salary
                        ).toLocaleString(
                          "en-IN"
                        )}`
                      : "-"
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}

        {activeTab ===
          "Attendance" && (
          <div className="p-6">
            <EmployeeAttendanceTab
              employeeId={
                employee.id
              }
            />
          </div>
        )}

        {/* Targets Tab */}

      {activeTab === "Targets" && (
  <div className="p-6">
    <EmployeeTargetTab
      employeeId={employee.id}
    />
  </div>
)}

        {/* Payroll Tab */}

 {activeTab === "Payroll" && (
  <div className="p-6">
    <EmployeePayrollTab
      employeeId={employee.id}
    />
  </div>
)}

        {/* Leaves Tab */}

       {activeTab === "Leaves" && (
  <div className="p-6">
    <EmployeeLeaveTab
      employeeId={employee.id}
    />
  </div>
)}

        {/* Activity Tab */}

        {activeTab ===
          "Activity" && (
          <EmptyTab
            title="Activity"
            text="Employee activity history will appear here."
          />
        )}
      </div>

      {/* Address Card */}

      {employee.address && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <MapPin
                size={20}
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Address
              </p>

              <p className="mt-1 font-medium text-slate-800">
                {
                  employee.address
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyTab({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="p-10 text-center">
      <h3 className="font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}