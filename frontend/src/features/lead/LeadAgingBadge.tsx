import type {
  LeadAgingInfo,
} from "../../types/lead.types";

export default function LeadAgingBadge({
  aging,
}: {
  aging?: LeadAgingInfo;
}) {
  if (!aging) {
    return null;
  }

  const styles: Record<
    string,
    string
  > = {
    HOT:
      "bg-red-50 text-red-700 border-red-200",

    WARM:
      "bg-amber-50 text-amber-700 border-amber-200",

    COLD:
      "bg-blue-50 text-blue-700 border-blue-200",

    STALE:
      "bg-slate-100 text-slate-700 border-slate-200",

    NEW:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      title={aging.reason}
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[
          aging.label
        ] ||
        styles.NEW
      }`}
    >
      {aging.label}
    </span>
  );
}