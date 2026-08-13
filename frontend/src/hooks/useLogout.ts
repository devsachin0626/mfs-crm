import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "./redux";
import { logout } from "../store/slices/authSlice";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());

    navigate("/login", {
      replace: true,
    });
  };

  return handleLogout;
};