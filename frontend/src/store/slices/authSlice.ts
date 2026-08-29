import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  clearImpersonationSession,
  getToken,
  removeToken,
} from "../../utils/auth";

export interface AuthEmployee {
  id: string;
  employeeCode: string;
  name: string;
  mobile?: string;
  email?: string;
  role: string;
  branch: string;
  profileImage?: string | null;
}

interface AuthState {
  employee: AuthEmployee | null;
  token: string | null;
  isAuthenticated: boolean;
}

const savedToken = getToken();

const initialState: AuthState = {
  employee: null,
  token: savedToken,
  isAuthenticated: Boolean(savedToken),
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        employee: AuthEmployee;
      }>
    ) => {
      state.token = action.payload.token;
      state.employee = action.payload.employee;
      state.isAuthenticated = true;
    },

    restoreEmployee: (
      state,
      action: PayloadAction<AuthEmployee>
    ) => {
      state.employee = action.payload;
      state.isAuthenticated = Boolean(state.token);
    },

    logout: (state) => {
      state.token = null;
      state.employee = null;
      state.isAuthenticated = false;

      removeToken();
      clearImpersonationSession();
    },
  },
});

export const {
  setCredentials,
  restoreEmployee,
  logout,
} = authSlice.actions;

export default authSlice.reducer;