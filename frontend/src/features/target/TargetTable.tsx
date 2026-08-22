import {
  Eye,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  EmployeeTarget,
} from "../../types/target.types";

import TargetProgress from "./TargetProgress";

type Props = {
  targets: EmployeeTarget[];
};

export default function TargetTable({
  targets,
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
                Month
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Brokerage Target
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Demat Target
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Revenue Progress
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {targets.map(
              (target) => {
                const revenueTarget =
                  Number(
                    target.revenueTarget
                  );

                const achieved =
                  Number(
                    target.achievedAmount
                  );

                return (
                  <tr
                    key={target.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {
                          target.employee
                            .name
                        }
                      </p>

                      <p className="text-sm text-slate-500">
                        {
                          target.employee
                            .employeeCode
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {getMonthName(
                        target.month
                      )}{" "}
                      {target.year}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      ₹
                      {Number(
                        target.brokerageTarget
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      {
                        target.dematTarget
                      }
                    </td>

                    <td className="px-5 py-4">
                      <TargetProgress
                        achieved={
                          achieved
                        }
                        target={
                          revenueTarget
                        }
                      />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/targets/${target.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {targets.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No targets found
        </div>
      )}
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