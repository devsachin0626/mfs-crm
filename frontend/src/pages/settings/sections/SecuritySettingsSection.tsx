import {
  KeyRound,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getRoles,
} from "../../../services/employee.service";

import {
  SettingsCard,
  SettingsSectionHeader,
} from "../SettingsLayout";

/* ============================
   ROLE TYPE
============================ */

interface SecurityRole {
  id: string;

  name: string;

  description?:
    | string
    | null;
}

/* ============================
   PAGE
============================ */

export default function SecuritySettingsSection() {
  const [
    roles,
    setRoles,
  ] =
    useState<
      SecurityRole[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* ============================
     LOAD ROLES
  ============================ */

  const loadRoles =
    async () => {
      try {
        setLoading(
          true
        );

        setError(
          null
        );

        const response =
          await getRoles();

        setRoles(
          Array.isArray(
            response?.roles
          )
            ? response.roles
            : []
        );
      } catch (error) {
        setError(
          getErrorMessage(
            error
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  useEffect(() => {
    void loadRoles();
  }, []);

  return (
    <div className="space-y-5">
      {/* ============================
          HEADER
      ============================ */}

      <SettingsSectionHeader
        title="Security Settings"
        description="Review CRM access controls, user roles, login security and administrator-level protections."
        action={
          <button
            type="button"
            onClick={() =>
              void loadRoles()
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
          ERROR
      ============================ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============================
          SECURITY OVERVIEW
      ============================ */}

      <div className="grid gap-4 md:grid-cols-3">
        <SecuritySummary
          icon={
            ShieldCheck
          }
          title="Settings Access"
          value="Admin Only"
          description="Main Settings Control Panel is restricted to administrators."
        />

        <SecuritySummary
          icon={
            KeyRound
          }
          title="Passwords"
          value="Hashed"
          description="Existing employee passwords are never displayed."
        />

        <SecuritySummary
          icon={
            UserCheck
          }
          title="Account Control"
          value="Enabled"
          description="Employee accounts can be deactivated or restored without deleting history."
        />
      </div>

      {/* ============================
          ROLES
      ============================ */}

      <SettingsCard
        title="System Roles"
        description="Roles currently configured in the CRM."
      >
        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2
              size={26}
              className="animate-spin text-blue-700"
            />
          </div>
        ) : roles.length ===
          0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <Users
              size={32}
              className="text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-700">
              No roles found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <TableHead>
                    Role
                  </TableHead>

                  <TableHead>
                    Description
                  </TableHead>

                  <TableHead>
                    Access Level
                  </TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {roles.map(
                  (role) => (
                    <tr
                      key={
                        role.id
                      }
                      className="hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <ShieldCheck
                              size={17}
                            />
                          </div>

                          <p className="text-sm font-semibold text-slate-800">
                            {
                              role.name
                            }
                          </p>
                        </div>
                      </td>

                      <td className="max-w-lg px-4 py-4 text-sm text-slate-500">
                        {role.description ||
                          "-"}
                      </td>

                      <td className="px-4 py-4">
                        <RoleBadge
                          role={
                            role.name
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>

      {/* ============================
          LOGIN SECURITY
      ============================ */}

      <SettingsCard
        title="Login & Account Security"
        description="Current security controls available in the CRM."
      >
        <SecurityRow
          icon={
            LockKeyhole
          }
          title="Password Storage"
          description="Employee passwords are stored as secure hashes. Existing passwords cannot be viewed from Settings or database."
          value="Protected"
        />

        <SecurityRow
          icon={
            KeyRound
          }
          title="Admin Password Reset"
          description="Admin can set a new password for an employee from Employee Settings without knowing the old password."
          value="Available"
        />

        <SecurityRow
          icon={
            UserCheck
          }
          title="Employee Login Access"
          description="Deactivate an employee account to disable active CRM usage while preserving historical records."
          value="Controlled"
        />

        <SecurityRow
          icon={
            ShieldCheck
          }
          title="Settings Control Panel"
          description="Settings configuration endpoints and the Settings page are designed for administrator access."
          value="Admin Only"
        />
      </SettingsCard>

      {/* ============================
          PERMISSIONS INFO
      ============================ */}

      <SettingsCard
        title="Role Permissions"
        description="Advanced module-level permission management."
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Permission Matrix
          </p>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-amber-700">
            CRM already contains Role
            and Permission database
            structures, but a complete
            role-permission assignment
            API is not currently exposed.
            Therefore this Settings V1
            does not show fake permission
            toggles.
          </p>

          <p className="mt-3 text-xs font-medium text-amber-700">
            Advanced permissions can be
            added safely in Settings V2
            after backend role-permission
            assignment APIs are completed.
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}

/* ============================
   SUMMARY
============================ */

function SecuritySummary({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon:
    React.ElementType;

  title: string;

  value: string;

  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon
          size={19}
        />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ============================
   SECURITY ROW
============================ */

function SecurityRow({
  icon: Icon,
  title,
  description,
  value,
}: {
  icon:
    React.ElementType;

  title: string;

  description: string;

  value: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Icon
            size={17}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <span className="w-fit shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        {value}
      </span>
    </div>
  );
}

/* ============================
   ROLE BADGE
============================ */

function RoleBadge({
  role,
}: {
  role: string;
}) {
  const normalized =
    role.toUpperCase();

  if (
    normalized ===
    "ADMIN"
  ) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Full Access
      </span>
    );
  }

  if (
    normalized ===
    "HR"
  ) {
    return (
      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
        HR Access
      </span>
    );
  }

  if (
    normalized ===
    "TEAM_LEADER"
  ) {
    return (
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
        Team Access
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Standard Access
    </span>
  );
}

/* ============================
   TABLE HEAD
============================ */

function TableHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
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