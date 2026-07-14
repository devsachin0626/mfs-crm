import DashboardLayout from "../../layouts/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-4 gap-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-gray-500">Today's Leads</h3>
          <p className="mt-2 text-3xl font-bold">300</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-gray-500">Calls Done</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-gray-500">Interested</h3>
          <p className="mt-2 text-3xl font-bold">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-gray-500">Sales</h3>
          <p className="mt-2 text-3xl font-bold">₹0</p>
        </div>
      </div>
    </DashboardLayout>
  );
}