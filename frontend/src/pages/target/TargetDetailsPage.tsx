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
  Pencil,
  Target,
  TrendingUp,
  WalletCards,
  Users,
} from "lucide-react";

import {
  getTargetById,
} from "../../services/target.service";

import type {
  EmployeeTarget,
} from "../../types/target.types";

import TargetProgress from "../../features/target/TargetProgress";

export default function TargetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [target, setTarget] =
    useState<EmployeeTarget | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadTarget = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const response =
          await getTargetById(id);

        setTarget(
          response.target
        );
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

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading target...
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

  if (!target) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Target not found
      </div>
    );
  }

  const revenueTarget =
    Number(
      target.revenueTarget
    );

  const achieved =
    Number(
      target.achievedAmount
    );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/targets")
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Target Details
            </h1>

            <p className="text-sm text-slate-500">
              {target.employee.name}
              {" • "}
              {target.employee.employeeCode}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/targets/${target.id}/edit`
            )
          }
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <Pencil size={17} />
          Edit Target
        </button>
      </div>

      {/* Employee */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Users size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {target.employee.name}
            </h2>

            <p className="text-sm text-slate-500">
              {target.employee.employeeCode}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {getMonthName(
                target.month
              )}{" "}
              {target.year}
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          title="Brokerage Target"
          value={`₹${Number(
            target.brokerageTarget
          ).toLocaleString(
            "en-IN"
          )}`}
          icon={
            <WalletCards
              size={20}
            />
          }
        />

        <InfoCard
          title="Demat Target"
          value={String(
            target.dematTarget
          )}
          icon={
            <Target size={20} />
          }
        />

        <InfoCard
          title="Revenue Target"
          value={`₹${revenueTarget.toLocaleString(
            "en-IN"
          )}`}
          icon={
            <Target size={20} />
          }
        />

        <InfoCard
          title="Achieved Amount"
          value={`₹${achieved.toLocaleString(
            "en-IN"
          )}`}
          icon={
            <TrendingUp
              size={20}
            />
          }
        />
      </div>

      {/* Progress */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">
          Revenue Achievement
        </h3>

        <div className="mt-5 max-w-xl">
          <TargetProgress
            achieved={achieved}
            target={revenueTarget}
          />
        </div>
      </div>
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