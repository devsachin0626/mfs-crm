import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getPayrolls,
} from "../../services/payroll.service";

import type {
  Payroll,
  PayrollQuery,
} from "../../types/payroll.types";

interface PayrollState {
  payrolls: Payroll[];

  loading: boolean;
  error: string | null;

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: PayrollState = {
  payrolls: [],

  loading: false,
  error: null,

  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export const fetchPayrolls =
  createAsyncThunk(
    "payroll/fetchPayrolls",

    async (
      params: PayrollQuery,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await getPayrolls(params);

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to load payrolls"
        );
      }
    }
  );

const payrollSlice = createSlice({
  name: "payroll",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(
        fetchPayrolls.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchPayrolls.fulfilled,
        (state, action) => {
          state.loading = false;

          state.payrolls =
            action.payload.payrolls;

          state.total =
            action.payload.total;

          state.page =
            action.payload.page;

          state.limit =
            action.payload.limit;

          state.totalPages =
            action.payload.totalPages;
        }
      )

      .addCase(
        fetchPayrolls.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to load payrolls";
        }
      );
  },
});

export default payrollSlice.reducer;