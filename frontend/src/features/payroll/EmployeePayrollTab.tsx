import {
  useEffect,
  useState,
} from "react";

import {
  getPayrolls,
} from "../../services/payroll.service";

import type {
  Payroll,
} from "../../types/payroll.types";

import PayrollStatusBadge from "./PayrollStatusBadge";

type Props = {
  employeeId: string;
};

export default function EmployeePayrollTab({
  employeeId,
}: Props) {
  const [payrolls, setPayrolls] =
    useState<Payroll[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadPayrolls = async () => {
      try {
        setLoading(true);

        const response =
          await getPayrolls({
            page: 1,
            limit: 100,
            employeeId,
          });

        setPayrolls(
          response.payrolls || []
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

    loadPayrolls();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading payroll...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left">
                Month
              </th>

              <th className="p-4 text-left">
                Gross
              </th>

              <th className="p-4 text-left">
                Incentive
              </th>

              <th className="p-4 text-left">
                Deduction
              </th>

              <th className="p-4 text-left">
                Net Salary
              </th>

              <th className="p-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {payrolls.map(
              (payroll) => (
                <tr
                  key={payroll.id}
                  className="border-t"
                >
                  <td className="p-4">
                    {getMonthName(
                      payroll.month
                    )}{" "}
                    {payroll.year}
                  </td>

                  <td className="p-4">
                    {money(
                      payroll.grossSalary
                    )}
                  </td>

                  <td className="p-4">
                    {money(
                      payroll.incentive
                    )}
                  </td>

                  <td className="p-4">
                    {money(
                      payroll.deduction
                    )}
                  </td>

                  <td className="p-4 font-semibold">
                    {money(
                      payroll.netSalary
                    )}
                  </td>

                  <td className="p-4">
                    <PayrollStatusBadge
                      status={
                        payroll.status
                      }
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {payrolls.length === 0 && (
        <div className="p-10 text-center text-slate-500">
          No payroll records found
        </div>
      )}
    </div>
  );
}

function money(
  value: number | string
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