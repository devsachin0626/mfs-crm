import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { getEmployees } from "../../services/employee.service";

import type {
  Employee,
  EmployeeQuery,
} from "../../types/employee.types";

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;

  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,

  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const fetchEmployees = createAsyncThunk(
  "employee/fetchEmployees",

  async (
    params: EmployeeQuery,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await getEmployees(params);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to load employees"
      );
    }
  }
);

const employeeSlice = createSlice({
  name: "employee",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(
        fetchEmployees.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchEmployees.fulfilled,
        (state, action) => {
          state.loading = false;

          state.employees =
            action.payload.employees;

          state.page =
            action.payload.page;

          state.limit =
            action.payload.limit;

          state.total =
            action.payload.total;

          state.totalPages =
            action.payload.totalPages;
        }
      )

      .addCase(
        fetchEmployees.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to load employees";
        }
      );
  },
});

export default employeeSlice.reducer;