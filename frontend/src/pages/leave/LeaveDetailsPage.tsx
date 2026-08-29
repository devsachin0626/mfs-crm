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
  Check,
  X,
} from "lucide-react";

import {
  getLeaveById,
  approveRejectLeave,
} from "../../services/leave.service";

import {
  useAppSelector,
} from "../../hooks/redux";

import LeaveStatusBadge from "../../features/leave/LeaveStatusBadge";

import type {
  Leave,
} from "../../types/leave.types";

export default function LeaveDetailsPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const employee = useAppSelector(
    (state) => state.auth.employee
  );

  const [leave, setLeave] =
    useState<Leave | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadLeave = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response =
        await getLeaveById(id);

      setLeave(response.leave);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Failed to load leave"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeave();
  }, [id]);

  const canProcessLeave =
    leave?.status === "PENDING" &&
    Boolean(employee?.id) &&
    employee?.id !== leave?.employeeId &&
    [
      "ADMIN",
      "HR",
      "TEAM_LEADER",
    ].includes(employee?.role || "");

  const handleDecision = async (
    status: "APPROVED" | "REJECTED"
  ) => {
    if (
      !id ||
      !canProcessLeave ||
      processing
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to ${status.toLowerCase()} this leave?`
      );

    if (!confirmed) return;

    try {
      setProcessing(true);
      setError("");

      await approveRejectLeave(
        id,
        status
      );

      await loadLeave();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Leave update failed"
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-3 text-sm text-slate-500">
            Loading leave...
          </p>
        </div>
      </div>
    );
  }

  if (error && !leave) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
        Leave not found
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
              navigate("/leaves")
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Leave Details
            </h1>

            <p className="text-sm text-slate-500">
              {leave.employee.name}
              {" • "}
              {
                leave.employee
                  .employeeCode
              }
            </p>
          </div>
        </div>

        {canProcessLeave && (
          <div className="flex gap-3">
            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleDecision(
                  "REJECTED"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <X size={17} />
              Reject
            </button>

            <button
              type="button"
              disabled={processing}
              onClick={() =>
                handleDecision(
                  "APPROVED"
                )
              }
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Check size={17} />
              Approve
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Employee Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {leave.employee.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {
                leave.employee
                  .employeeCode
              }
            </p>
          </div>

          <LeaveStatusBadge
            status={leave.status}
          />
        </div>
      </div>

      {/* Leave Information */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          label="From Date"
          value={formatDate(
            leave.fromDate
          )}
        />

        <InfoCard
          label="To Date"
          value={formatDate(
            leave.toDate
          )}
        />

        <InfoCard
          label="Total Days"
          value={String(
            calculateDays(
              leave.fromDate,
              leave.toDate
            )
          )}
        />

        <InfoCard
          label="Status"
          value={leave.status}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Leave Reason
          </h3>

          <p className="mt-4 text-sm leading-6 text-slate-700">
            {leave.reason ||
              "No reason provided."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">
            Approval Information
          </h3>

          <div className="mt-5 space-y-4">
            <DetailRow
              label="Status"
              value={leave.status}
            />

            <DetailRow
              label="Approved By"
              value={
                leave.approvedBy
                  ?.name || "-"
              }
            />

            <DetailRow
              label="Approver Code"
              value={
                leave.approvedBy
                  ?.employeeCode ||
                "-"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="text-right text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateDays(
  fromDate: string,
  toDate: string
) {
  const from =
    new Date(fromDate);

  const to =
    new Date(toDate);

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