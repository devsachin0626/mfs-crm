import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { getAttendances } from "../../services/attendance.service";

import type {
  Attendance,
  AttendanceQuery,
} from "../../types/attendance.types";

interface AttendanceState {
  attendances: Attendance[];
  loading: boolean;
  error: string | null;

  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: AttendanceState = {
  attendances: [],
  loading: false,
  error: null,

  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export const fetchAttendances = createAsyncThunk(
  "attendance/fetchAttendances",
  async (
    params: AttendanceQuery,
    { rejectWithValue }
  ) => {
    try {
      const response =
        await getAttendances(params);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to load attendance"
      );
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(
        fetchAttendances.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAttendances.fulfilled,
        (state, action) => {
          state.loading = false;

          state.attendances =
            action.payload.attendances;

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
        fetchAttendances.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to load attendance";
        }
      );
  },
});

export default attendanceSlice.reducer;