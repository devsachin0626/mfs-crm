import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

import type { Employee } from "../../types/employee.types";

type Props = {
  employees: Employee[];
};

export default function EmployeeTable({
  employees,
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
                Contact
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Role
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Branch
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Manager
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
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">
                    {employee.name}
                  </div>

                  <div className="text-sm text-slate-500">
                    {employee.employeeCode}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="text-sm text-slate-800">
                    {employee.mobile}
                  </div>

                  <div className="text-sm text-slate-500">
                    {employee.email || "-"}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {employee.role}
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {employee.branch}
                </td>

                <td className="px-5 py-4 text-sm text-slate-700">
                  {employee.reportingManager || "-"}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      employee.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {employee.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() =>
                      navigate(
                        `/employees/${employee.id}`
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Eye size={16} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="p-10 text-center text-slate-500">
          No employees found
        </div>
      )}
    </div>
  );
}