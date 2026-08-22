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

type AttendanceEditData = {
  id: string;
  attendanceDate: string;

  checkIn?: string | null;
  checkOut?: string | null;

  status:
    | "PRESENT"
    | "LATE"
    | "HALF_DAY"
    | "ABSENT"
    | "LEAVE"
    | "HOLIDAY";

  remarks?: string | null;

  employee: {
    id: string;
    employeeCode: string;
    name: string;
  };
};

export default function AttendanceEditPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [attendance, setAttendance] =
    useState<AttendanceEditData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    checkIn: "",
    checkOut: "",
    status: "PRESENT",
    remarks: "",
  });

  useEffect(() => {
    const loadAttendance = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response =
          await getAttendanceById(id);

        const data =
          response.attendance;

        setAttendance(data);

        setForm({
          checkIn: toDateTimeLocal(
            data.checkIn
          ),

          checkOut: toDateTimeLocal(
            data.checkOut
          ),

          status:
            data.status ||
            "PRESENT",

          remarks:
            data.remarks || "",
        });
      } catch (error: any) {
        setError(
          error?.response?.data
            ?.message ||
            "Failed to load attendance"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
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

    try {
      setSaving(true);
      setError("");

      await updateAttendance(id, {
        checkIn:
          form.checkIn
            ? new Date(
                form.checkIn
              ).toISOString()
            : undefined,

        checkOut:
          form.checkOut
            ? new Date(
                form.checkOut
              ).toISOString()
            : undefined,

        status:
          form.status,

        remarks:
          form.remarks.trim() ||
          undefined,
      });

      navigate(
        `/attendance/${id}`
      );
    } catch (error: any) {
      setError(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Attendance update failed"
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
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Attendance not found
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
              `/attendance/${attendance.id}`
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Attendance
          </h1>

          <p className="text-sm text-slate-500">
            {attendance.employee.name}
            {" • "}
            {
              attendance.employee
                .employeeCode
            }
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
        {/* Attendance Info */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-slate-900">
              Attendance Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              HR/Admin can correct
              attendance time and status
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Employee">
              <input
                value={
                  attendance.employee
                    .name
                }
                disabled
                className={`${inputClass} bg-slate-50 text-slate-500`}
              />
            </Field>

            <Field label="Attendance Date">
              <input
                value={new Date(
                  attendance.attendanceDate
                ).toLocaleDateString(
                  "en-IN"
                )}
                disabled
                className={`${inputClass} bg-slate-50 text-slate-500`}
              />
            </Field>

            <Field label="Check In">
              <input
                type="datetime-local"
                name="checkIn"
                value={form.checkIn}
                onChange={
                  handleChange
                }
                className={
                  inputClass
                }
              />
            </Field>

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

          <div className="mt-5">
            <Field label="Remarks">
              <textarea
                name="remarks"
                value={
                  form.remarks
                }
                onChange={
                  handleChange
                }
                rows={4}
                placeholder="Add correction reason or remarks..."
                className={
                  inputClass
                }
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
                `/attendance/${attendance.id}`
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

  const localDate =
    new Date(
      date.getTime() -
        offset * 60 * 1000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}