import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LeadListPage from "../pages/lead/LeadListPage";
import LeadDetailsPage from "../pages/lead/LeadDetailsPage";
import EmployeeListPage from "../pages/employee/EmployeeListPage";
import EmployeeDetailsPage from "../pages/employee/EmployeeDetailsPage";
import EmployeeCreatePage from "../pages/employee/EmployeeCreatePage";
import EmployeeEditPage from "../pages/employee/EmployeeEditPage";
import AttendanceListPage from "../pages/attendance/AttendanceListPage";
import AttendanceDetailsPage from "../pages/attendance/AttendanceDetailsPage";
import AttendanceEditPage from "../pages/attendance/AttendanceEditPage";

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
              path="/leads/:id"
              element={<LeadDetailsPage />}
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