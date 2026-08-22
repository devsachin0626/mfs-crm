import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: number | string;
  icon: ReactNode;
};

export default function StatsCard({
  title,
  value,
  icon,
}: StatsCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {value}
          </h3>
        </div>

        <div className="rounded-xl bg-blue-100 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}