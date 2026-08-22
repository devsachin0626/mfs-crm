import {
  useEffect,
  useState,
} from "react";

import {
  getTargets,
} from "../../services/target.service";

import type {
  EmployeeTarget,
} from "../../types/target.types";

import TargetProgress from "./TargetProgress";

type Props = {
  employeeId: string;
};

export default function EmployeeTargetTab({
  employeeId,
}: Props) {
  const [targets, setTargets] =
    useState<EmployeeTarget[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadTargets = async () => {
      try {
        setLoading(true);

        const response =
          await getTargets({
            page: 1,
            limit: 100,
            employeeId,
          });

        setTargets(
          response.targets || []
        );
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Failed to load targets"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTargets();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading targets...
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
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 text-left">
              Month
            </th>

            <th className="p-4 text-left">
              Brokerage
            </th>

            <th className="p-4 text-left">
              Demat
            </th>

            <th className="p-4 text-left">
              Revenue
            </th>

            <th className="p-4 text-left">
              Progress
            </th>
          </tr>
        </thead>

        <tbody>
          {targets.map(
            (target) => (
              <tr
                key={target.id}
                className="border-t"
              >
                <td className="p-4">
                  {getMonthName(
                    target.month
                  )}{" "}
                  {target.year}
                </td>

                <td className="p-4">
                  ₹
                  {Number(
                    target.brokerageTarget
                  ).toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="p-4">
                  {target.dematTarget}
                </td>

                <td className="p-4">
                  ₹
                  {Number(
                    target.revenueTarget
                  ).toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="p-4">
                  <TargetProgress
                    achieved={Number(
                      target.achievedAmount
                    )}
                    target={Number(
                      target.revenueTarget
                    )}
                  />
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {targets.length === 0 && (
        <div className="p-10 text-center text-slate-500">
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