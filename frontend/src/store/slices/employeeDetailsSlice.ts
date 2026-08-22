import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { getEmployeeById } from "../../services/employee.service";

import type { EmployeeDetails } from "../../types/employee.types";

interface EmployeeDetailsState {
  employee: EmployeeDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeDetailsState = {
  employee: null,
  loading: false,
  error: null,
};

export const fetchEmployeeDetails =
  createAsyncThunk(
    "employeeDetails/fetchEmployeeDetails",

    async (
      id: string,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await getEmployeeById(id);

        return response.employee;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to load employee"
        );
      }
    }
  );

const employeeDetailsSlice =
  createSlice({
    name: "employeeDetails",

    initialState,

    reducers: {
      clearEmployeeDetails: (
        state
      ) => {
        state.employee = null;
        state.error = null;
      },
    },

    extraReducers: (builder) => {
      builder

        .addCase(
          fetchEmployeeDetails.pending,
          (state) => {
            state.loading = true;
            state.error = null;
          }
        )

        .addCase(
          fetchEmployeeDetails.fulfilled,
          (state, action) => {
            state.loading = false;
            state.employee =
              action.payload;
          }
        )

        .addCase(
          fetchEmployeeDetails.rejected,
          (state, action) => {
            state.loading = false;

            state.error =
              (action.payload as string) ||
              "Failed to load employee";
          }
        );
    },
  });

export const {
  clearEmployeeDetails,
} = employeeDetailsSlice.actions;

export default employeeDetailsSlice.reducer;