import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { getLeaves } from "../../services/leave.service";

import type {
  Leave,
  LeaveQuery,
} from "../../types/leave.types";

interface LeaveState {
  leaves: Leave[];
  loading: boolean;
  error: string | null;

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: LeaveState = {
  leaves: [],
  loading: false,
  error: null,

  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export const fetchLeaves = createAsyncThunk(
  "leave/fetchLeaves",
  async (
    params: LeaveQuery,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await getLeaves(params);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to load leaves"
      );
    }
  }
);

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchLeaves.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchLeaves.fulfilled,
        (state, action) => {
          state.loading = false;
          state.leaves =
            action.payload.leaves;

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
        fetchLeaves.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to load leaves";
        }
      );
  },
});

export default leaveSlice.reducer;