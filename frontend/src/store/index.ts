import {
  configureStore,
} from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import leadReducer from "./slices/leadSlice";
import leadDetailsReducer from "./slices/leadDetailsSlice";
import employeeReducer from "./slices/employeeSlice";
import employeeDetailsReducer from "./slices/employeeDetailsSlice";
import attendanceReducer from "./slices/attendanceSlice";
import leaveReducer from "./slices/leaveSlice";
import targetReducer from "./slices/targetSlice";
import payrollReducer from "./slices/payrollSlice";
import trialReducer from "./slices/trialSlice";
import reportReducer from "./slices/reportSlice";

export const store =
  configureStore({
    reducer: {
      auth: authReducer,

      dashboard:
        dashboardReducer,

      lead: leadReducer,

      leadDetails:
        leadDetailsReducer,

      employee:
        employeeReducer,

      employeeDetails:
        employeeDetailsReducer,

      attendance:
        attendanceReducer,

      leave: leaveReducer,

      target:
        targetReducer,

      payroll:
        payrollReducer,

      trial:
        trialReducer,
        report: reportReducer,
    },
  });

export type RootState =
  ReturnType<
    typeof store.getState
  >;

export type AppDispatch =
  typeof store.dispatch;