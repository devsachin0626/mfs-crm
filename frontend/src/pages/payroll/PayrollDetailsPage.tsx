import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Pencil,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";

import {
  getPayrollById,
} from "../../services/payroll.service";

import type {
  Payroll,
} from "../../types/payroll.types";

import PayrollStatusBadge from "../../features/payroll/PayrollStatusBadge";

export default function PayrollDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [payroll, setPayroll] =
    useState<Payroll | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadPayroll = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response =
          await getPayrollById(id);

        setPayroll(
          response.payroll
        );
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load payroll"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPayroll();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading payroll...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Payroll not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/payroll")
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payroll Details
            </h1>

            <p className="text-sm text-slate-500">
              {payroll.employee.name}
              {" • "}
              {getMonthName(payroll.month)}{" "}
              {payroll.year}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/payroll/${payroll.id}/edit`
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Pencil size={17} />
          Edit Payroll
        </button>
      </div>

      {/* Employee */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-4 text-blue-700">
              <UserRound size={26} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {payroll.employee.name}
              </h2>

              <p className="text-sm text-slate-500">
                {payroll.employee.employeeCode}
              </p>
            </div>
          </div>

          <PayrollStatusBadge
            status={payroll.status}
          />
        </div>
      </div>

      {/* Salary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          title="Basic Salary"
          value={money(
            payroll.basicSalary
          )}
          icon={
            <Banknote size={20} />
          }
        />

        <InfoCard
          title="Gross Salary"
          value={money(
            payroll.grossSalary
          )}
          icon={
            <Banknote size={20} />
          }
        />

        <InfoCard
          title="Incentive + Bonus"
          value={money(
            Number(payroll.incentive) +
              Number(payroll.bonus)
          )}
          icon={
            <TrendingUp size={20} />
          }
        />

        <InfoCard
          title="Net Salary"
          value={money(
            payroll.netSalary
          )}
          icon={
            <Banknote size={20} />
          }
        />
      </div>

      {/* Main Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <CalendarDays size={19} />
            </div>

            <h3 className="font-semibold text-slate-900">
              Attendance Summary
            </h3>
          </div>

          <div className="space-y-4">
            <DetailRow
              label="Working Days"
              value={String(
                payroll.workingDays
              )}
            />

            <DetailRow
              label="Present Days"
              value={String(
                payroll.presentDays
              )}
            />

            <DetailRow
              label="Late Days"
              value={String(
                payroll.lateDays
              )}
            />

            <DetailRow
              label="Half Days"
              value={String(
                payroll.halfDays
              )}
            />

            <DetailRow
              label="Leave Days"
              value={String(
                payroll.leaveDays
              )}
            />

            <DetailRow
              label="Absent Days"
              value={String(
                payroll.absentDays
              )}
            />
          </div>
        </section>

        {/* Salary Breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <TrendingUp size={19} />
            </div>

            <h3 className="font-semibold text-slate-900">
              Salary Breakdown
            </h3>
          </div>

          <div className="space-y-4">
            <DetailRow
              label="Basic Salary"
              value={money(
                payroll.basicSalary
              )}
            />

            <DetailRow
              label="Gross Salary"
              value={money(
                payroll.grossSalary
              )}
            />

            <DetailRow
              label="Incentive"
              value={money(
                payroll.incentive
              )}
            />

            <DetailRow
              label="Bonus"
              value={money(
                payroll.bonus
              )}
            />

            <DetailRow
              label="Deduction"
              value={money(
                payroll.deduction
              )}
              icon={
                <TrendingDown
                  size={16}
                />
              }
            />

            <DetailRow
              label="Net Salary"
              value={money(
                payroll.netSalary
              )}
            />
          </div>
        </section>
      </div>

      {/* Remarks */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">
          Remarks
        </h3>

        <p className="mt-4 text-sm leading-6 text-slate-700">
          {payroll.remarks ||
            "No remarks added."}
        </p>
      </section>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
        {icon}
        {value}
      </div>
    </div>
  );
}

function money(
  value: string | number
) {
  return `₹${Number(
    value
  ).toLocaleString("en-IN")}`;
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