import {
  useEffect,
  useState,
} from "react";

import type {
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
  getTargetById,
  updateTarget,
} from "../../services/target.service";

export default function TargetEditPage() {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [employeeName, setEmployeeName] =
    useState("");

  const [monthYear, setMonthYear] =
    useState("");

  const [form, setForm] =
    useState({
      brokerageTarget: "",
      dematTarget: "",
      revenueTarget: "",
      achievedAmount: "",
    });

  useEffect(() => {
    const loadTarget = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const response =
          await getTargetById(id);

        const target =
          response.target;

        setEmployeeName(
          `${target.employee.name} - ${target.employee.employeeCode}`
        );

        setMonthYear(
          `${getMonthName(
            target.month
          )} ${target.year}`
        );

        setForm({
          brokerageTarget:
            String(
              target.brokerageTarget
            ),

          dematTarget:
            String(
              target.dematTarget
            ),

          revenueTarget:
            String(
              target.revenueTarget
            ),

          achievedAmount:
            String(
              target.achievedAmount
            ),
        });
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load target"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTarget();
  }, [id]);

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await updateTarget(
        id,
        {
          brokerageTarget:
            Number(
              form.brokerageTarget ||
                0
            ),

          dematTarget:
            Number(
              form.dematTarget ||
                0
            ),

          revenueTarget:
            Number(
              form.revenueTarget ||
                0
            ),

          achievedAmount:
            Number(
              form.achievedAmount ||
                0
            ),
        }
      );

      navigate(
        `/targets/${id}`
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Target update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        Loading target...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/targets/${id}`
            )
          }
          className="rounded-xl border border-slate-200 bg-white p-2.5"
        >
          <ArrowLeft
            size={19}
          />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Target
          </h1>

          <p className="text-sm text-slate-500">
            {employeeName}
            {" • "}
            {monthYear}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Brokerage Target">
              <input
                type="number"
                min="0"
                value={
                  form.brokerageTarget
                }
                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,
                      brokerageTarget:
                        e.target.value,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Demat Target">
              <input
                type="number"
                min="0"
                value={
                  form.dematTarget
                }
                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,
                      dematTarget:
                        e.target.value,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Revenue Target">
              <input
                type="number"
                min="0"
                value={
                  form.revenueTarget
                }
                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,
                      revenueTarget:
                        e.target.value,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Achieved Amount">
              <input
                type="number"
                min="0"
                value={
                  form.achievedAmount
                }
                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,
                      achievedAmount:
                        e.target.value,
                    })
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/targets/${id}`
              )
            }
            className="rounded-xl border border-slate-200 px-5 py-2.5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-white disabled:opacity-50"
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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function getMonthName(
  month: number
) {
  return new Date(
    2000,
    month - 1
  ).toLocaleString("en-IN", {
    month: "long",
  });
}