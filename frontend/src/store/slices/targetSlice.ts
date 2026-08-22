import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getTargets,
} from "../../services/target.service";

import type {
  EmployeeTarget,
  TargetQuery,
} from "../../types/target.types";

interface TargetState {
  targets: EmployeeTarget[];

  loading: boolean;
  error: string | null;

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: TargetState = {
  targets: [],

  loading: false,
  error: null,

  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export const fetchTargets =
  createAsyncThunk(
    "target/fetchTargets",

    async (
      params: TargetQuery,
      { rejectWithValue }
    ) => {
      try {
        const response =
          await getTargets(params);

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data?.message ||
            "Failed to load targets"
        );
      }
    }
  );

const targetSlice = createSlice({
  name: "target",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(
        fetchTargets.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchTargets.fulfilled,
        (state, action) => {
          state.loading = false;

          state.targets =
            action.payload.targets;

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
        fetchTargets.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to load targets";
        }
      );
  },
});

export default targetSlice.reducer;