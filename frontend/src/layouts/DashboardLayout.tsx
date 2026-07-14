import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white">
        <div className="border-b border-blue-700 p-5">
          <h1 className="text-2xl font-bold">MFS CRM</h1>
          <p className="text-sm text-blue-200">
            Mahakal Financial Services
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <button className="w-full rounded-lg p-3 text-left hover:bg-blue-800">
            Dashboard
          </button>

          <button className="w-full rounded-lg p-3 text-left hover:bg-blue-800">
            Leads
          </button>

          <button className="w-full rounded-lg p-3 text-left hover:bg-blue-800">
            Clients
          </button>

          <button className="w-full rounded-lg p-3 text-left hover:bg-blue-800">
            Products
          </button>

          <button className="w-full rounded-lg p-3 text-left hover:bg-blue-800">
            Payments
          </button>

          <button className="w-full rounded-lg p-3 text-left hover:bg-blue-800">
            Reports
          </button>

          <button className="w-full rounded-lg p-3 text-left hover:bg-blue-800">
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <h2 className="text-xl font-semibold">Dashboard</h2>

          <div className="font-medium">
            Welcome, Employee
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}