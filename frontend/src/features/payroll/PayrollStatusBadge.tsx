type Props = {
  status: string;
};

export default function PayrollStatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-amber-50 text-amber-700",

    PROCESSED:
      "bg-blue-50 text-blue-700",

    PAID:
      "bg-emerald-50 text-emerald-700",
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