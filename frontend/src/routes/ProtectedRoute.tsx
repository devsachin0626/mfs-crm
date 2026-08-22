import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { restoreEmployee, logout } from "../store/slices/authSlice";
import api from "../services/api";

export default function ProtectedRoute() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { token, employee } = useAppSelector(
    (state) => state.auth
  );

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const restoreAuth = async () => {
      // No token = user is not logged in
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      // Employee already available in Redux
      if (employee) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        if (response.data?.success && response.data?.employee) {
          dispatch(
            restoreEmployee(response.data.employee)
          );
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error(
          "Auth restoration failed:",
          error
        );

        dispatch(logout());
      } finally {
        setCheckingAuth(false);
      }
    };

    restoreAuth();
  }, [token, employee, dispatch]);

  // Checking JWT / employee
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />

          <p className="text-sm text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // No valid token
  if (!token || !employee) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}