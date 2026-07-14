import LeadRow from "./LeadRow";

const leads = [
  {
    id: 1,
    name: "Rahul Sharma",
    mobile: "9876543210",
    city: "Indore",
    status: "New",
  },
  {
    id: 2,
    name: "Amit Verma",
    mobile: "9988776655",
    city: "Bhopal",
    status: "Interested",
  },
  {
    id: 3,
    name: "Mohit Jain",
    mobile: "9090909090",
    city: "Delhi",
    status: "Follow-up",
  },
];

export default function LeadTable() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Mobile</th>
            <th className="p-3 text-left">City</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </tbody>
      </table>
    </div>
  );
}