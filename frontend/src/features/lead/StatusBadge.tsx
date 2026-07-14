type Status =
  | "New"
  | "Interested"
  | "Follow-up"
  | "Callback"
  | "Busy"
  | "Switch Off"
  | "Invalid Number"
  | "DND"
  | "Not Reachable"
  | "NPC"
  | "Not Interested";

type Props = {
  status: Status;
};

const colors: Record<Status, string> = {
  "New": "bg-gray-100 text-gray-700",
  "Interested": "bg-green-100 text-green-700",
  "Follow-up": "bg-yellow-100 text-yellow-700",
  "Callback": "bg-blue-100 text-blue-700",
  "Busy": "bg-orange-100 text-orange-700",
  "Switch Off": "bg-slate-200 text-slate-700",
  "Invalid Number": "bg-red-100 text-red-700",
  "DND": "bg-purple-100 text-purple-700",
  "Not Reachable": "bg-amber-100 text-amber-700",
  "NPC": "bg-pink-100 text-pink-700",
  "Not Interested": "bg-gray-300 text-gray-800",
};

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  );
}