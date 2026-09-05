import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  KeyRound,
  Save,
  UserRound,
} from "lucide-react";

import {
  changePassword,
} from "../../services/auth.service";

import {
  getOwnProfile,
  updateOwnProfile,
} from "../../services/employee.service";

import {
  useAppDispatch,
} from "../../hooks/redux";

import {
  restoreEmployee,
} from "../../store/slices/authSlice";

import type {
  EmployeeDetails,
} from "../../types/employee.types";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const errorMessage = (
  error: unknown,
  fallback: string
) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    return response?.data
      ?.message || fallback;
  }

  return fallback;
};

export default function ProfilePage() {
  const dispatch =
    useAppDispatch();

  const [profile, setProfile] =
    useState<EmployeeDetails | null>(
      null
    );

  const [form, setForm] =
    useState({
      name: "",
      mobile: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      address: "",
    });

  const [passwords, setPasswords] =
    useState({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);
  const [profileMessage, setProfileMessage] =
    useState("");
  const [passwordMessage, setPasswordMessage] =
    useState("");
  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await getOwnProfile();
        const employee =
          response.employee;

        setProfile(employee);
        setForm({
          name:
            employee.name || "",
          mobile:
            employee.mobile || "",
          email:
            employee.email || "",
          gender:
            employee.gender || "",
          dateOfBirth:
            employee.dateOfBirth
              ?.slice(0, 10) || "",
          address:
            employee.address || "",
        });
      } catch (loadError) {
        setError(
          errorMessage(
            loadError,
            "Failed to load profile"
          )
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const saveProfile = async (
    event: FormEvent
  ) => {
    event.preventDefault();
    setError("");
    setProfileMessage("");

    const mobile =
      form.mobile.replace(
        /\D/g,
        ""
      );

    if (
      !form.name.trim() ||
      !/^[6-9]\d{9}$/.test(
        mobile
      )
    ) {
      setError(
        "Enter name and a valid 10 digit mobile number"
      );
      return;
    }

    try {
      setSaving(true);
      const response =
        await updateOwnProfile({
          ...form,
          name:
            form.name.trim(),
          mobile,
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
        });

      const employee:
        EmployeeDetails =
          response.employee;
      setProfile(employee);
      dispatch(
        restoreEmployee({
          id:
            employee.id,
          employeeCode:
            employee.employeeCode,
          name:
            employee.name,
          mobile:
            employee.mobile,
          email:
            employee.email ||
            undefined,
          role:
            employee.role.name,
          branch:
            employee.branch.name,
          profileImage:
            employee.profileImage,
        })
      );
      setProfileMessage(
        "Profile updated successfully"
      );
    } catch (saveError) {
      setError(
        errorMessage(
          saveError,
          "Profile update failed"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (
    event: FormEvent
  ) => {
    event.preventDefault();
    setError("");
    setPasswordMessage("");

    if (
      passwords.newPassword.length < 8
    ) {
      setError(
        "New password must be at least 8 characters"
      );
      return;
    }

    if (
      passwords.newPassword !==
      passwords.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match"
      );
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(
        passwords.oldPassword,
        passwords.newPassword
      );
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage(
        "Password changed successfully"
      );
    } catch (passwordError) {
      setError(
        errorMessage(
          passwordError,
          "Password change failed"
        )
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and login password.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <form
          onSubmit={saveProfile}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <UserRound size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Personal Information
              </h2>
              <p className="text-xs text-slate-500">
                Job details are controlled by Admin.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Employee Code">
              <input
                value={profile?.employeeCode || ""}
                disabled
                className={inputClass}
              />
            </Field>
            <Field label="Role">
              <input
                value={profile?.role.name || ""}
                disabled
                className={inputClass}
              />
            </Field>
            <Field label="Name">
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name:
                      event.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Mobile">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(event) =>
                  setForm({
                    ...form,
                    mobile:
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email:
                      event.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(event) =>
                  setForm({
                    ...form,
                    gender:
                      event.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) =>
                  setForm({
                    ...form,
                    dateOfBirth:
                      event.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address:
                        event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {profileMessage && (
            <p className="mt-4 text-sm font-medium text-emerald-700">
              {profileMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form
          onSubmit={savePassword}
          className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
              <KeyRound size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">
                Change Password
              </h2>
              <p className="text-xs text-slate-500">
                Your current password is required.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <PasswordField
              label="Current Password"
              value={passwords.oldPassword}
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  oldPassword: value,
                })
              }
            />
            <PasswordField
              label="New Password"
              value={passwords.newPassword}
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  newPassword: value,
                })
              }
            />
            <PasswordField
              label="Confirm New Password"
              value={passwords.confirmPassword}
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: value,
                })
              }
            />
          </div>

          {passwordMessage && (
            <p className="mt-4 text-sm font-medium text-emerald-700">
              {passwordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function PasswordField({
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
        type="password"
        autoComplete="new-password"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={inputClass}
      />
    </Field>
  );
}
