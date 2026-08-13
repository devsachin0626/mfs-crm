import { useEffect, useState, type ReactNode } from "react";

import { useAppDispatch } from "../../hooks/redux";
import { restoreEmployee, logout } from "../../store/slices/authSlice";
import { getToken } from "../../utils/auth";

import api from "../../services/api";

interface AuthInitializerProps {
  children: ReactNode;
}

export default function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
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
      } catch {
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-700 border-t-transparent" />

          <p className="mt-4 text-sm text-gray-600">
            Loading MFS CRM...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}