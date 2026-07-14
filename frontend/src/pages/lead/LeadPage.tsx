import DashboardLayout from "../../layouts/DashboardLayout";
import LeadTable from "../../features/lead/LeadTable";

export default function LeadPage() {
  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">
        Lead Management
      </h1>

      <LeadTable />
    </DashboardLayout>
  );
}