import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAppSelector } from "../hooks/redux";

export default function ProtectedRoute() {
  const location = useLocation();

  const { isAuthenticated, token } = useAppSelector(
    (state) => state.auth
  );

  if (!isAuthenticated || !token) {
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