import {
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Send,
  User,
} from "lucide-react";

import {
  applyLeave,
} from "../../services/leave.service";

import {
  useAppSelector,
} from "../../hooks/redux";

/* ============================
   ROLE HELPER
============================ */

const getRoleName = (
  role: unknown
): string => {
  if (
    typeof role ===
    "string"
  ) {
    return role;
  }

  if (
    role &&
    typeof role ===
      "object" &&
    "name" in role
  ) {
    const roleObject =
      role as {
        name?: unknown;
      };

    if (
      typeof roleObject.name ===
      "string"
    ) {
      return roleObject.name;
    }
  }

  return "";
};

export default function LeaveCreatePage() {
  const navigate =
    useNavigate();

  const employee =
    useAppSelector(
      (state) =>
        state.auth.employee
    );

  const roleName =
    getRoleName(
      employee?.role
    );

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
    form,
    setForm,
  ] =
    useState({
      fromDate: "",
      toDate: "",
      reason: "",
    });

  /* ============================
     TODAY
  ============================ */

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      setError("");

      /* ============================
         VALIDATION
      ============================ */

      if (
        !form.fromDate ||
        !form.toDate
      ) {
        setError(
          "From Date and To Date are required"
        );

        return;
      }

      if (
        !form.reason.trim()
      ) {
        setError(
          "Leave Reason is required"
        );

        return;
      }

      if (
        new Date(
          form.fromDate
        ) >
        new Date(
          form.toDate
        )
      ) {
        setError(
          "From Date cannot be greater than To Date"
        );

        return;
      }

      /* ============================
         APPLY
      ============================ */

      try {
        setSaving(
          true
        );

        await applyLeave({
          fromDate:
            form.fromDate,

          toDate:
            form.toDate,

          reason:
            form.reason.trim(),
        });

        navigate(
          "/leaves"
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Leave application failed"
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div className="space-y-6">
      {/* ============================
          HEADER
      ============================ */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/leaves"
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
            Apply Leave
          </h1>

          <p className="text-sm text-slate-500">
            Create your leave request
          </p>
        </div>
      </div>

      {/* ============================
          EMPLOYEE INFO
      ============================ */}

      {employee && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <User
                size={20}
              />
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {
                  employee.name
                }
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {
                  employee.employeeCode
                }

                {roleName && (
                  <>
                    {" • "}
                    {
                      roleName
                    }
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          ERROR
      ============================ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============================
          FORM
      ============================ */}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <CalendarDays
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Leave Information
              </h2>

              <p className="text-sm text-slate-500">
                Select leave dates and enter reason
              </p>
            </div>
          </div>

          {/* ============================
              DATES
          ============================ */}

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="From Date"
              required
            >
              <input
                type="date"
                min={
                  today
                }
                value={
                  form.fromDate
                }
                onChange={(
                  e
                ) => {
                  const value =
                    e.target
                      .value;

                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      fromDate:
                        value,

                      toDate:
                        previous.toDate &&
                        previous.toDate <
                          value
                          ? ""
                          : previous.toDate,
                    })
                  );
                }}
                className={
                  inputClass
                }
              />
            </Field>

            <Field
              label="To Date"
              required
            >
              <input
                type="date"
                min={
                  form.fromDate ||
                  today
                }
                value={
                  form.toDate
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      toDate:
                        e.target
                          .value,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>
          </div>

          {/* ============================
              TOTAL DAYS
          ============================ */}

          {form.fromDate &&
            form.toDate && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-700">
                  Total Leave Days:{" "}
                  <span className="font-semibold">
                    {calculateDays(
                      form.fromDate,
                      form.toDate
                    )}
                  </span>
                </p>
              </div>
            )}

          {/* ============================
              REASON
          ============================ */}

          <div className="mt-5">
            <Field
              label="Reason"
              required
            >
              <textarea
                value={
                  form.reason
                }
                onChange={(
                  e
                ) =>
                  setForm(
                    (
                      previous
                    ) => ({
                      ...previous,

                      reason:
                        e.target
                          .value,
                    })
                  )
                }
                rows={4}
                maxLength={
                  500
                }
                placeholder="Enter leave reason..."
                className={
                  inputClass
                }
              />

              <p className="mt-2 text-right text-xs text-slate-400">
                {
                  form.reason
                    .length
                }
                /500
              </p>
            </Field>
          </div>
        </section>

        {/* ============================
            ACTION BUTTONS
        ============================ */}

        <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              navigate(
                "/leaves"
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Send
              size={17}
            />

            {saving
              ? "Submitting..."
              : "Apply Leave"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================
   INPUT CLASS
============================ */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
    ReactNode;
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

/* ============================
   CALCULATE DAYS
============================ */

function calculateDays(
  fromDate: string,
  toDate: string
) {
  const from =
    new Date(
      `${fromDate}T00:00:00`
    );

  const to =
    new Date(
      `${toDate}T00:00:00`
    );

  const diff =
    to.getTime() -
    from.getTime();

  return (
    Math.floor(
      diff /
        (1000 *
          60 *
          60 *
          24)
    ) + 1
  );
}