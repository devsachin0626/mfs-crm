type Props = {
  status: string;
};

export default function AttendanceStatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    PRESENT:
      "bg-emerald-50 text-emerald-700",

    LATE:
      "bg-amber-50 text-amber-700",

    HALF_DAY:
      "bg-orange-50 text-orange-700",

    ABSENT:
      "bg-red-50 text-red-700",

    LEAVE:
      "bg-blue-50 text-blue-700",

    HOLIDAY:
      "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}