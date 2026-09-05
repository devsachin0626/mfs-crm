import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ============================
   AUTH
============================ */

import LoginPage from "../pages/auth/LoginPage";

/* ============================
   DASHBOARD
============================ */

import DashboardPage from "../pages/dashboard/DashboardPage";

/* ============================
   EMPLOYEE
============================ */

import EmployeeListPage from "../pages/employee/EmployeeListPage";
import EmployeeDetailsPage from "../pages/employee/EmployeeDetailsPage";
import EmployeeCreatePage from "../pages/employee/EmployeeCreatePage";
import EmployeeEditPage from "../pages/employee/EmployeeEditPage";
import ProfilePage from "../pages/employee/ProfilePage";

/* ============================
   ATTENDANCE
============================ */

import AttendanceListPage from "../pages/attendance/AttendanceListPage";
import AttendanceDetailsPage from "../pages/attendance/AttendanceDetailsPage";
import AttendanceEditPage from "../pages/attendance/AttendanceEditPage";

/* ============================
   LEAVE
============================ */

import LeaveListPage from "../pages/leave/LeaveListPage";
import LeaveCreatePage from "../pages/leave/LeaveCreatePage";
import LeaveDetailsPage from "../pages/leave/LeaveDetailsPage";

/* ============================
   TARGET
============================ */

import TargetListPage from "../pages/target/TargetListPage";
import TargetCreatePage from "../pages/target/TargetCreatePage";
import TargetDetailsPage from "../pages/target/TargetDetailsPage";
import TargetEditPage from "../pages/target/TargetEditPage";

/* ============================
   PAYROLL
============================ */

import PayrollListPage from "../pages/payroll/PayrollListPage";
import PayrollCreatePage from "../pages/payroll/PayrollCreatePage";
import PayrollDetailsPage from "../pages/payroll/PayrollDetailsPage";
import PayrollEditPage from "../pages/payroll/PayrollEditPage";

/* ============================
   LEAD
============================ */

import LeadListPage from "../pages/lead/LeadListPage";
import LeadCreatePage from "../pages/lead/LeadCreatePage";
import LeadDetailsPage from "../pages/lead/LeadDetailsPage";
import LeadEditPage from "../pages/lead/LeadEditPage";
import LeadPipelinePage from "../pages/lead/LeadPipelinePage";
import LeadImportPage from "../pages/lead/LeadImportPage";

/* ============================
   FOLLOW-UP / CALLING
============================ */

import FollowUpListPage from "../pages/followup/FollowUpListPage";
import CallingWorkspacePage from "../pages/calling/CallingWorkspacePage";

/* ============================
   TRIAL / DEMO
============================ */

import TrialListPage from "../pages/trial/TrialListPage";
import TrialCreatePage from "../pages/trial/TrialCreatePage";
import TrialDetailsPage from "../pages/trial/TrialDetailsPage";

/* ============================
   ROUTE / LAYOUT
============================ */

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";



/* ============================
   REPORTS
============================ */

import ReportPage from "../pages/report/ReportPage";

/* ============================
    Settings
============================ */


import SettingsPage from "../pages/settings/SettingsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================
            PUBLIC
        ============================ */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* ============================
            AUTHENTICATED USERS
        ============================ */}

        <Route
          element={
            <ProtectedRoute />
          }
        >
          <Route
            element={
              <DashboardLayout />
            }
          >
            {/* ============================
                DASHBOARD
            ============================ */}

            <Route
              path="/dashboard"
              element={
                <DashboardPage />
              }
            />

            <Route
              path="/profile"
              element={
                <ProfilePage />
              }
            />

            {/* ============================
                LEADS
                ALL LOGGED-IN ROLES
            ============================ */}

            <Route
              path="/leads"
              element={
                <LeadListPage />
              }
            />

            <Route
              path="/leads/create"
              element={
                <LeadCreatePage />
              }
            />

            <Route
              path="/leads/pipeline"
              element={
                <LeadPipelinePage />
              }
            />

            <Route
              path="/leads/:id/edit"
              element={
                <LeadEditPage />
              }
            />

            <Route
              path="/leads/:id"
              element={
                <LeadDetailsPage />
              }
            />

            {/* ============================
                FOLLOW UPS
            ============================ */}

            <Route
              path="/follow-ups"
              element={
                <FollowUpListPage />
              }
            />

            {/* ============================
                CALLING
            ============================ */}

            <Route
              path="/calling"
              element={
                <CallingWorkspacePage />
              }
            />

            {/* ============================
                TRIAL / DEMO
                ALL LOGGED-IN ROLES

                EMPLOYEE:
                own trials + start own

                TEAM LEADER:
                self + team

                ADMIN / HR:
                company scope
            ============================ */}

            <Route
              path="/trials"
              element={
                <TrialListPage />
              }
            />

            <Route
              path="/trials/create"
              element={
                <TrialCreatePage />
              }
            />

            <Route
              path="/trials/:id"
              element={
                <TrialDetailsPage />
              }
            />

            {/* ============================
                EMPLOYEE
                VIEW ROUTES
            ============================ */}

            <Route
              path="/employees"
              element={
                <EmployeeListPage />
              }
            />

            <Route
              path="/employees/:id"
              element={
                <EmployeeDetailsPage />
              }
            />

            {/* ============================
                ATTENDANCE
            ============================ */}

            <Route
              path="/attendance"
              element={
                <AttendanceListPage />
              }
            />

            <Route
              path="/attendance/:id"
              element={
                <AttendanceDetailsPage />
              }
            />

            {/* ============================
                LEAVE
            ============================ */}

            <Route
              path="/leaves"
              element={
                <LeaveListPage />
              }
            />

            <Route
              path="/leaves/create"
              element={
                <LeaveCreatePage />
              }
            />

            <Route
              path="/leaves/:id"
              element={
                <LeaveDetailsPage />
              }
            />

            {/* ============================
                TARGET VIEW
            ============================ */}

            <Route
              path="/targets"
              element={
                <TargetListPage />
              }
            />

            <Route
              path="/targets/:id"
              element={
                <TargetDetailsPage />
              }
            />

            {/* ============================
                PAYROLL VIEW
            ============================ */}

            <Route
              path="/payroll"
              element={
                <PayrollListPage />
              }
            />

            <Route
              path="/payroll/:id"
              element={
                <PayrollDetailsPage />
              }
            />

            {/* ============================
                ADMIN / HR
            ============================ */}

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                  ]}
                />
              }
            >
              {/* EMPLOYEE MANAGEMENT */}

              <Route
                path="/employees/create"
                element={
                  <EmployeeCreatePage />
                }
              />

              <Route
                path="/employees/edit/:id"
                element={
                  <EmployeeEditPage />
                }
              />

              {/* ATTENDANCE EDIT */}

              <Route
                path="/attendance/:id/edit"
                element={
                  <AttendanceEditPage />
                }
              />

              {/* PAYROLL MANAGEMENT */}

              <Route
                path="/payroll/create"
                element={
                  <PayrollCreatePage />
                }
              />

              <Route
                path="/payroll/:id/edit"
                element={
                  <PayrollEditPage />
                }
              />
            </Route>


            {/* ============================
    REPORTS
    ADMIN ONLY
============================ */}

<Route
  element={
    <ProtectedRoute
      allowedRoles={[
        "ADMIN",
      ]}
    />
  }
>

  <Route
  path="/settings"
  element={
    <SettingsPage />
  }
/>
  <Route
    path="/reports"
    element={
      <ReportPage />
    }
  />
</Route>

            {/* ============================
                ADMIN / HR / TEAM LEADER
            ============================ */}

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "HR",
                    "TEAM_LEADER",
                  ]}
                />
              }
            >
              {/* TARGET MANAGEMENT */}

              <Route
                path="/targets/create"
                element={
                  <TargetCreatePage />
                }
              />

              <Route
                path="/targets/:id/edit"
                element={
                  <TargetEditPage />
                }
              />

              {/* LEAD IMPORT */}

              <Route
                path="/leads/import"
                element={
                  <LeadImportPage />
                }
              />
            </Route>
          </Route>
        </Route>

        {/* ============================
            DEFAULT
        ============================ */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* ============================
            404
        ============================ */}

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900">
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
