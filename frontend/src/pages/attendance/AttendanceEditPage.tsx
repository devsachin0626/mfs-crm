import {
  useEffect,
  useState,
} from "react";

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
} from "lucide-react";

import {
  getAttendanceById,
  updateAttendance,
} from "../../services/attendance.service";

import type {
  Attendance,
  AttendanceStatus,
} from "../../types/attendance.types";

/* ============================
   FORM TYPE
============================ */

type AttendanceEditForm = {
  checkIn: string;

  checkOut: string;

  status:
    AttendanceStatus;

  remarks: string;
};

/* ============================
   PAGE
============================ */

export default function AttendanceEditPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [
    attendance,
    setAttendance,
  ] =
    useState<Attendance | null>(
      null
    );

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
    form,
    setForm,
  ] =
    useState<AttendanceEditForm>({
      checkIn: "",

      checkOut: "",

      status:
        "PRESENT",

      remarks: "",
    });

  /* ============================
     LOAD
  ============================ */

  useEffect(() => {
    let active =
      true;

    const loadAttendance =
      async () => {
        if (!id) {
          setError(
            "Attendance ID is missing"
          );

          setLoading(
            false
          );

          return;
        }

        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const response =
            await getAttendanceById(
              id
            );

          if (!active) {
            return;
          }

          const data =
            response.attendance;

          setAttendance(
            data
          );

          setForm({
            checkIn:
              toDateTimeLocal(
                data.checkIn
              ),

            checkOut:
              toDateTimeLocal(
                data.checkOut
              ),

            status:
              data.status ||
              "PRESENT",

            remarks:
              data.remarks ||
              "",
          });
        } catch (
          error: any
        ) {
          if (!active) {
            return;
          }

          setAttendance(
            null
          );

          setError(
            error?.response
              ?.data
              ?.message ||
              error?.message ||
              "Failed to load attendance"
          );
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      };

    void loadAttendance();

    return () => {
      active =
        false;
    };
  }, [id]);

  /* ============================
     CHANGE
  ============================ */

  const handleChange =
    (
      event: ChangeEvent<
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
      >
    ) => {
      const {
        name,
        value,
      } =
        event.target;

      setForm(
        (
          previous
        ) => ({
          ...previous,

          [name]:
            value,
        })
      );
    };

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

      if (
        !id ||
        !attendance
      ) {
        return;
      }

      /* ============================
         DATE VALIDATION
      ============================ */

      const checkIn =
        form.checkIn
          ? new Date(
              form.checkIn
            )
          : null;

      const checkOut =
        form.checkOut
          ? new Date(
              form.checkOut
            )
          : null;

      if (
        checkIn &&
        Number.isNaN(
          checkIn.getTime()
        )
      ) {
        setError(
          "Invalid Check-In Time"
        );

        return;
      }

      if (
        checkOut &&
        Number.isNaN(
          checkOut.getTime()
        )
      ) {
        setError(
          "Invalid Check-Out Time"
        );

        return;
      }

      if (
        checkIn &&
        checkOut &&
        checkOut <
          checkIn
      ) {
        setError(
          "Check-Out cannot be before Check-In"
        );

        return;
      }

      try {
        setSaving(
          true
        );

        setError(
          ""
        );

        await updateAttendance(
          id,
          {
            checkIn:
              checkIn
                ? checkIn.toISOString()
                : null,

            checkOut:
              checkOut
                ? checkOut.toISOString()
                : null,

            /*
             * Manual Admin/HR
             * status override.
             */

            status:
              form.status,

            remarks:
              form.remarks
                .trim() ||
              null,
          }
        );

        navigate(
          `/attendance/${id}`
        );
      } catch (
        error: any
      ) {
        setError(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Attendance update failed"
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /* ============================
     LOADING
  ============================ */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  /* ============================
     NOT FOUND
  ============================ */

  if (!attendance) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/attendance"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft
            size={17}
          />

          Back to Attendance
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="font-medium text-slate-700">
            Attendance not found
          </p>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

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
              `/attendance/${attendance.id}`
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft
            size={19}
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {attendance.employee
              ?.name ||
              "Employee"}
            {" • "}
            {attendance.employee
              ?.employeeCode ||
              "-"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {formatDate(
              attendance.attendanceDate
            )}
          </p>
        </div>
      </div>

      {/* ============================
          ERROR
      ============================ */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ============================
          INFO
      ============================ */}

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm font-semibold text-blue-800">
          Manual Attendance Correction
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-600">
          Check-In and Check-Out changes
          will recalculate working hours.
          Selected status is treated as
          the final Admin/HR override.
        </p>
      </div>

      {/* ============================
          FORM
      ============================ */}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Attendance Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Correct employee time,
              attendance status and
              remarks.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* EMPLOYEE */}

            <Field label="Employee">
              <input
                type="text"
                value={
                  attendance.employee
                    ?.name ||
                  "-"
                }
                disabled
                className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
              />
            </Field>

            {/* DATE */}

            <Field label="Attendance Date">
              <input
                type="text"
                value={formatDate(
                  attendance.attendanceDate
                )}
                disabled
                className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-500`}
              />
            </Field>

            {/* CHECK IN */}

            <Field label="Check In">
              <input
                type="datetime-local"
                name="checkIn"
                value={
                  form.checkIn
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </Field>

            {/* CHECK OUT */}

            <Field label="Check Out">
              <input
                type="datetime-local"
                name="checkOut"
                value={
                  form.checkOut
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </Field>

            {/* STATUS */}

            <Field
              label="Status"
              required
            >
              <select
                name="status"
                value={
                  form.status
                }
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              >
                <option value="PRESENT">
                  Present
                </option>

                <option value="LATE">
                  Late
                </option>

                <option value="HALF_DAY">
                  Half Day
                </option>

                <option value="ABSENT">
                  Absent
                </option>

                <option value="LEAVE">
                  Leave
                </option>

                <option value="HOLIDAY">
                  Holiday
                </option>
              </select>
            </Field>
          </div>

          {/* REMARKS */}

          <div className="mt-5">
            <Field label="Correction Remarks">
              <textarea
                name="remarks"
                value={
                  form.remarks
                }
                onChange={
                  handleChange
                }
                rows={4}
                placeholder="Reason for attendance correction..."
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </section>

        {/* ============================
            ACTIONS
        ============================ */}

        <div className="flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            disabled={
              saving
            }
            onClick={() =>
              navigate(
                `/attendance/${attendance.id}`
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving
            }
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
    React.ReactNode;
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
   DATE FORMAT
============================ */

function formatDate(
  value: string
) {
  const datePart =
    value.slice(
      0,
      10
    );

  const [
    year,
    month,
    day,
  ] =
    datePart
      .split("-")
      .map(
        Number
      );

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
}

/* ============================
   TO DATETIME LOCAL
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
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset *
          60 *
          1000
    );

  return localDate
    .toISOString()
    .slice(
      0,
      16
    );
}