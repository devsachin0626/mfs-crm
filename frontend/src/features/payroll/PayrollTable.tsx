import {
  Eye,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import type {
  Payroll,
} from "../../types/payroll.types";

import PayrollStatusBadge from "./PayrollStatusBadge";

type Props = {
  payrolls: Payroll[];
};

export default function PayrollTable({
  payrolls,
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
                Basic
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Gross
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Incentive
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Deduction
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                Net Salary
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
            {payrolls.map(
              (payroll) => (
                <tr
                  key={payroll.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">
                      {
                        payroll.employee
                          .name
                      }
                    </p>

                    <p className="text-sm text-slate-500">
                      {
                        payroll.employee
                          .employeeCode
                      }
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-700">
                    {getMonthName(
                      payroll.month
                    )}{" "}
                    {payroll.year}
                  </td>

                  <MoneyCell
                    value={
                      payroll.basicSalary
                    }
                  />

                  <MoneyCell
                    value={
                      payroll.grossSalary
                    }
                  />

                  <MoneyCell
                    value={
                      payroll.incentive
                    }
                  />

                  <MoneyCell
                    value={
                      payroll.deduction
                    }
                  />

                  <MoneyCell
                    value={
                      payroll.netSalary
                    }
                    bold
                  />

                  <td className="px-5 py-4">
                    <PayrollStatusBadge
                      status={
                        payroll.status
                      }
                    />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/payroll/${payroll.id}`
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

      {payrolls.length === 0 && (
        <div className="p-10 text-center text-sm text-slate-500">
          No payroll records found
        </div>
      )}
    </div>
  );
}

function MoneyCell({
  value,
  bold = false,
}: {
  value: number | string;
  bold?: boolean;
}) {
  return (
    <td
      className={`px-5 py-4 text-sm text-slate-700 ${
        bold ? "font-bold" : ""
      }`}
    >
      ₹
      {Number(
        value
      ).toLocaleString("en-IN")}
    </td>
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