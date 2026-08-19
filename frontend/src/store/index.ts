import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import leadReducer from "./slices/leadSlice";
import leadDetailsReducer from "./slices/leadDetailsSlice";
import employeeReducer from "./slices/employeeSlice";
import employeeDetailsReducer from "./slices/employeeDetailsSlice";
import attendanceReducer from "./slices/attendanceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    lead: leadReducer,
    leadDetails: leadDetailsReducer,
    employee: employeeReducer,
    employeeDetails: employeeDetailsReducer,
    attendance: attendanceReducer,
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;