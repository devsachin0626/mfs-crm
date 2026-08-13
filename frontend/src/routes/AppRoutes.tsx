import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import LeadDetailsPage from "../pages/lead/LeadDetailsPage";

import ProtectedRoute from "./ProtectedRoute";
import LogoutButton from "../components/auth/LogoutButton";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
        <Route
  path="/dashboard"
  element={
    <div className="min-h-screen bg-slate-100">
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-700">
          MFS CRM Dashboard
        </h1>

        <LogoutButton />
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold">
          Welcome to Dashboard
        </h2>
      </div>
    </div>
  }
/>

          <Route
            path="/leads/:id"
            element={<LeadDetailsPage />}
          />
        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold">404</h1>

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