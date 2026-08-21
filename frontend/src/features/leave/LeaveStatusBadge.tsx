type Props = {
  status: string;
};

export default function LeaveStatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-amber-50 text-amber-700",

    APPROVED:
      "bg-emerald-50 text-emerald-700",

    REJECTED:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}