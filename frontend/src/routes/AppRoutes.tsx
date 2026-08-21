import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LeadDetailsPage from "../pages/lead/LeadDetailsPage";
import EmployeeListPage from "../pages/employee/EmployeeListPage";
import EmployeeDetailsPage from "../pages/employee/EmployeeDetailsPage";
import EmployeeCreatePage from "../pages/employee/EmployeeCreatePage";
import EmployeeEditPage from "../pages/employee/EmployeeEditPage";
import AttendanceListPage from "../pages/attendance/AttendanceListPage";
import AttendanceDetailsPage from "../pages/attendance/AttendanceDetailsPage";
import AttendanceEditPage from "../pages/attendance/AttendanceEditPage";
import LeaveListPage from "../pages/leave/LeaveListPage";
import LeaveCreatePage from "../pages/leave/LeaveCreatePage";
import LeaveDetailsPage from "../pages/leave/LeaveDetailsPage";
import TargetListPage from "../pages/target/TargetListPage";
import TargetCreatePage from "../pages/target/TargetCreatePage";
import TargetDetailsPage from "../pages/target/TargetDetailsPage";
import TargetEditPage from "../pages/target/TargetEditPage";
import PayrollListPage from "../pages/payroll/PayrollListPage";
import PayrollCreatePage from "../pages/payroll/PayrollCreatePage";
import PayrollDetailsPage from "../pages/payroll/PayrollDetailsPage";
import PayrollEditPage from "../pages/payroll/PayrollEditPage";
import LeadListPage from "../pages/lead/LeadListPage";
import LeadCreatePage from "../pages/lead/LeadCreatePage";
import LeadEditPage from "../pages/lead/LeadEditPage";
import FollowUpListPage from "../pages/followup/FollowUpListPage";
import CallingWorkspacePage from "../pages/calling/CallingWorkspacePage";
import LeadPipelinePage from "../pages/lead/LeadPipelinePage";
import LeadImportPage from "../pages/lead/LeadImportPage";

import ProtectedRoute from "./ProtectedRoute";

import DashboardLayout from "../layouts/DashboardLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

          <Route
  path="/leads"
  element={<LeadListPage />}
/>

            <Route
  path="/employees"
  element={<EmployeeListPage />}
/>

<Route
  path="/employees/create"
  element={<EmployeeCreatePage />}
/>

<Route
  path="/employees/edit/:id"
  element={<EmployeeEditPage />}
/>

<Route
  path="/employees/:id"
  element={<EmployeeDetailsPage />}
/>

<Route
  path="/attendance"
  element={<AttendanceListPage />}


/>

<Route
  path="/attendance/:id/edit"
  element={<AttendanceEditPage />}
/>

<Route
  path="/attendance/:id"
  element={<AttendanceDetailsPage />}
/>

<Route
  path="/leaves"
  element={<LeaveListPage />}
/>

<Route
  path="/leaves/create"
  element={<LeaveCreatePage />}
/>

<Route
  path="/leaves/:id"
  element={<LeaveDetailsPage />}


/>
<Route
  path="/targets"
  element={<TargetListPage />}
/>

<Route
  path="/targets/create"
  element={<TargetCreatePage />}
/>

<Route
  path="/targets/:id/edit"
  element={<TargetEditPage />}
/>

<Route
  path="/targets/:id"
  element={<TargetDetailsPage />}
/>
<Route
  path="/payroll"
  element={<PayrollListPage />}
/>

<Route
  path="/payroll/create"
  element={<PayrollCreatePage />}
/>

<Route
  path="/payroll/:id/edit"
  element={<PayrollEditPage />}
/>

<Route
  path="/payroll/:id"
  element={<PayrollDetailsPage />}
/>

<Route
  path="/leads/create"
  element={<LeadCreatePage />}


/>

<Route
  path="/leads/pipeline"
  element={<LeadPipelinePage />}
/>


<Route
  path="/leads/:id/edit"
  element={<LeadEditPage />}
/>

<Route
  path="/leads/:id"
  element={<LeadDetailsPage />}
/>

<Route
  path="/leads/import"
  element={<LeadImportPage />}
/>

<Route
  path="/follow-ups"
  element={<FollowUpListPage />}
/>

<Route
  path="/calling"
  element={<CallingWorkspacePage />}
/>





          </Route>
        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold">
                  404
                </h1>

                <p className="mt-2 text-gray-500">
                  Page Not Found
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}