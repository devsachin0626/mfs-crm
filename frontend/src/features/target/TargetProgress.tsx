type Props = {
  achieved: number;
  target: number;
};

export default function TargetProgress({
  achieved,
  target,
}: Props) {
  const percentage =
    target > 0
      ? Math.min(
          (achieved / target) * 100,
          100
        )
      : 0;

  return (
    <div className="min-w-40">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {achieved.toLocaleString("en-IN")}
        </span>

        <span className="font-medium text-slate-700">
          {percentage.toFixed(1)}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-700 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-xs text-slate-400">
        Target:{" "}
        {target.toLocaleString("en-IN")}
      </p>
    </div>
  );
}