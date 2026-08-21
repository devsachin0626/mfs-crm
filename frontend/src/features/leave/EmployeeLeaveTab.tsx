import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import {
  getLeaves,
} from "../../services/leave.service";

import type {
  Leave,
} from "../../types/leave.types";

import LeaveStatusBadge from "./LeaveStatusBadge";

type Props = {
  employeeId: string;
};

export default function EmployeeLeaveTab({
  employeeId,
}: Props) {
  const [leaves, setLeaves] =
    useState<Leave[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getLeaves({
            page: 1,
            limit: 100,
            employeeId,
          });

        setLeaves(
          response.leaves || []
        );
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load leave history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaves();
  }, [employeeId]);

  const pending =
    leaves.filter(
      (item) =>
        item.status === "PENDING"
    ).length;

  const approved =
    leaves.filter(
      (item) =>
        item.status === "APPROVED"
    ).length;

  const rejected =
    leaves.filter(
      (item) =>
        item.status === "REJECTED"
    ).length;

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

        <p className="mt-3 text-sm text-slate-500">
          Loading leave history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leaves"
          value={leaves.length}
          icon={
            <CalendarDays size={19} />
          }
        />

        <StatCard
          title="Pending"
          value={pending}
          icon={<Clock3 size={19} />}
        />

        <StatCard
          title="Approved"
          value={approved}
          icon={
            <CheckCircle2 size={19} />
          }
        />

        <StatCard
          title="Rejected"
          value={rejected}
          icon={
            <XCircle size={19} />
          }
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-semibold text-slate-900">
            Leave History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <TableHead>
                  From
                </TableHead>

                <TableHead>
                  To
                </TableHead>

                <TableHead>
                  Days
                </TableHead>

                <TableHead>
                  Reason
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Approved By
                </TableHead>
              </tr>
            </thead>

            <tbody>
              {leaves.map(
                (leave) => (
                  <tr
                    key={leave.id}
                    className="border-t border-slate-100"
                  >
                    <TableCell>
                      {formatDate(
                        leave.fromDate
                      )}
                    </TableCell>

                    <TableCell>
                      {formatDate(
                        leave.toDate
                      )}
                    </TableCell>

                    <TableCell>
                      {calculateDays(
                        leave.fromDate,
                        leave.toDate
                      )}
                    </TableCell>

                    <TableCell>
                      {leave.reason ||
                        "-"}
                    </TableCell>

                    <td className="px-5 py-4">
                      <LeaveStatusBadge
                        status={
                          leave.status
                        }
                      />
                    </td>

                    <TableCell>
                      {leave.approvedBy
                        ?.name || "-"}
                    </TableCell>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {leaves.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-500">
            No leave history found
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
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

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-5 py-4 text-sm text-slate-700">
      {children}
    </td>
  );
}

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString("en-IN");
}

function calculateDays(
  fromDate: string,
  toDate: string
) {
  const from =
    new Date(fromDate);

  const to =
    new Date(toDate);

  return (
    Math.floor(
      (to.getTime() -
        from.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}