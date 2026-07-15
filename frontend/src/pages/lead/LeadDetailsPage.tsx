import DashboardLayout from "../../layouts/DashboardLayout";

export default function LeadDetailsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">

        <h1 className="mb-6 text-3xl font-bold">
          Lead Details
        </h1>

        <div className="rounded-xl bg-white p-6 shadow">

          {/* Lead Information */}

          <div className="grid grid-cols-2 gap-6">

            <div>
              <label className="text-sm text-gray-500">
                Name
              </label>

              <p className="font-semibold">
                Rahul Sharma
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Mobile
              </label>

              <p className="font-semibold">
                9876543210
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                Email
              </label>

              <p>
                rahul@gmail.com
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">
                City
              </label>

              <p>
                Indore
              </p>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}