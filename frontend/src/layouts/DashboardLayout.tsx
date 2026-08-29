import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ImpersonationBanner from "../components/layout/ImpersonationBanner";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />
        <ImpersonationBanner />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}