import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Attendance } from "../../types/attendance.types";

import AttendanceStatusBadge from "./AttendanceStatusBadge";

type Props = {
  attendances: Attendance[];
};

function formatTime(
  value?: string | null
) {
  if (!value) return "-";

  return new Date(
    value
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AttendanceTable({
  attendances,
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
                Date
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Check In
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Check Out
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Hours
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {attendances.map(
              (attendance) => (
                <tr
                  key={attendance.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {attendance
                        .employee
                        ?.name || "-"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {attendance
                        .employee
                        ?.employeeCode ||
                        "-"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {new Date(
                      attendance.attendanceDate
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {formatTime(
                      attendance.checkIn
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {formatTime(
                      attendance.checkOut
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {attendance.workingHours ??
                      "-"}
                  </td>

                  <td className="px-5 py-4">
                    <AttendanceStatusBadge
                      status={
                        attendance.status
                      }
                    />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/attendance/${attendance.id}`
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

      {attendances.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No attendance records found
        </div>
      )}
    </div>
  );
}