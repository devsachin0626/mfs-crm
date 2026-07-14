import StatusBadge from "./StatusBadge";

type Lead = {
  id: number;
  name: string;
  mobile: string;
  city: string;
  status: any;
};

type Props = {
  lead: Lead;
};

export default function LeadRow({ lead }: Props) {
  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="p-3">{lead.id}</td>
      <td className="p-3">{lead.name}</td>
      <td className="p-3">{lead.mobile}</td>
      <td className="p-3">{lead.city}</td>
      <td className="p-3">
        <StatusBadge status={lead.status} />
      </td>
    </tr>
  );
}