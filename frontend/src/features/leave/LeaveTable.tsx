import {
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import type {
  Leave,
} from "../../types/leave.types";

import LeaveStatusBadge from "./LeaveStatusBadge";

type Props = {
  leaves: Leave[];
};

export default function LeaveTable({
  leaves,
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Employee
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                From
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                To
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Reason
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Approved By
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {leaves.map(
              (leave) => (
                <tr
                  key={leave.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {leave.employee.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      {
                        leave.employee
                          .employeeCode
                      }
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {formatDate(
                      leave.fromDate
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {formatDate(
                      leave.toDate
                    )}
                  </td>

                  <td className="max-w-xs truncate px-5 py-4 text-sm text-slate-700">
                    {leave.reason || "-"}
                  </td>

                  <td className="px-5 py-4">
                    <LeaveStatusBadge
                      status={leave.status}
                    />
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {leave.approvedBy?.name ||
                      "-"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/leaves/${leave.id}`
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {leaves.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No leave requests found
        </div>
      )}
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