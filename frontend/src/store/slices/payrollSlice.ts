import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getPayrolls,
} from "../../services/payroll.service";

import type {
  Payroll,
  PayrollListResponse,
  PayrollQuery,
} from "../../types/payroll.types";

/* ============================
   STATE
============================ */

interface PayrollState {
  payrolls:
    Payroll[];

  loading:
    boolean;

  error:
    | string
    | null;

  total:
    number;

  page:
    number;

  limit:
    number;

  totalPages:
    number;
}

/* ============================
   INITIAL STATE
============================ */

const initialState: PayrollState = {
  payrolls: [],

  loading: false,

  error: null,

  total: 0,

  page: 1,

  limit: 10,

  totalPages: 0,
};

/* ============================
   FETCH PAYROLLS
============================ */

export const fetchPayrolls =
  createAsyncThunk<
    PayrollListResponse,
    PayrollQuery,
    {
      rejectValue: string;
    }
  >(
    "payroll/fetchPayrolls",

    async (
      params,
      {
        rejectWithValue,
      }
    ) => {
      try {
        return await getPayrolls(
          params
        );
      } catch (
        error: any
      ) {
        return rejectWithValue(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Failed to load payrolls"
        );
      }
    }
  );

/* ============================
   SLICE
============================ */

const payrollSlice =
  createSlice({
    name:
      "payroll",

    initialState,

    reducers: {
      clearPayrollError:
        (
          state
        ) => {
          state.error =
            null;
        },

      resetPayroll:
        (
          state
        ) => {
          state.payrolls =
            [];

          state.loading =
            false;

          state.error =
            null;

          state.total =
            0;

          state.page =
            1;

          state.limit =
            10;

          state.totalPages =
            0;
        },
    },

    extraReducers:
      (
        builder
      ) => {
        builder
          .addCase(
            fetchPayrolls.pending,

            (
              state
            ) => {
              state.loading =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            fetchPayrolls.fulfilled,

            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.error =
                null;

              state.payrolls =
                action.payload
                  .payrolls;

              state.total =
                action.payload
                  .total;

              state.page =
                action.payload
                  .page;

              state.limit =
                action.payload
                  .limit;

              state.totalPages =
                action.payload
                  .totalPages;
            }
          )

          .addCase(
            fetchPayrolls.rejected,

            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.error =
                action.payload ||
                "Failed to load payrolls";
            }
          );
      },
  });

/* ============================
   ACTIONS
============================ */

export const {
  clearPayrollError,
  resetPayroll,
} =
  payrollSlice.actions;

/* ============================
   REDUCER
============================ */

export default payrollSlice.reducer;