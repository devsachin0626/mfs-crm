import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getAttendances,
} from "../../services/attendance.service";

import type {
  Attendance,
  AttendanceQuery,
  AttendanceListResponse,
} from "../../types/attendance.types";

/* ============================
   STATE
============================ */

interface AttendanceState {
  attendances: Attendance[];

  loading: boolean;

  error:
    | string
    | null;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  /*
   * Selected payroll month.
   *
   * Example:
   * month = 8
   * year = 2026
   *
   * means:
   * 26 Jul → 25 Aug
   */

  month:
    | number
    | null;

  year:
    | number
    | null;

  /*
   * Actual attendance cycle
   * returned by backend.
   */

  cycleStart:
    | string
    | null;

  cycleEnd:
    | string
    | null;
}

/* ============================
   INITIAL STATE
============================ */

const initialState: AttendanceState = {
  attendances: [],

  loading: false,

  error: null,

  total: 0,

  page: 1,

  limit: 20,

  totalPages: 0,

  month: null,

  year: null,

  cycleStart: null,

  cycleEnd: null,
};

/* ============================
   FETCH ATTENDANCES
============================ */

export const fetchAttendances =
  createAsyncThunk<
    AttendanceListResponse,
    AttendanceQuery,
    {
      rejectValue: string;
    }
  >(
    "attendance/fetchAttendances",

    async (
      params,
      {
        rejectWithValue,
      }
    ) => {
      try {
        const response =
          await getAttendances(
            params
          );

        return response;
      } catch (
        error: any
      ) {
        return rejectWithValue(
          error?.response
            ?.data
            ?.message ||
            error?.message ||
            "Failed to load attendance"
        );
      }
    }
  );

/* ============================
   SLICE
============================ */

const attendanceSlice =
  createSlice({
    name:
      "attendance",

    initialState,

    reducers: {
      /* ============================
         CLEAR ERROR
      ============================ */

      clearAttendanceError:
        (
          state
        ) => {
          state.error =
            null;
        },

      /* ============================
         RESET ATTENDANCE
      ============================ */

      resetAttendance:
        (
          state
        ) => {
          state.attendances =
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
            20;

          state.totalPages =
            0;

          state.month =
            null;

          state.year =
            null;

          state.cycleStart =
            null;

          state.cycleEnd =
            null;
        },
    },

    extraReducers:
      (
        builder
      ) => {
        builder
          /* ============================
             PENDING
          ============================ */

          .addCase(
            fetchAttendances.pending,

            (
              state
            ) => {
              state.loading =
                true;

              state.error =
                null;
            }
          )

          /* ============================
             SUCCESS
          ============================ */

          .addCase(
            fetchAttendances.fulfilled,

            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.error =
                null;

              state.attendances =
                action.payload
                  .attendances;

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

              state.month =
                action.payload
                  .month ??
                null;

              state.year =
                action.payload
                  .year ??
                null;

              state.cycleStart =
                action.payload
                  .cycleStart ??
                null;

              state.cycleEnd =
                action.payload
                  .cycleEnd ??
                null;
            }
          )

          /* ============================
             ERROR
          ============================ */

          .addCase(
            fetchAttendances.rejected,

            (
              state,
              action
            ) => {
              state.loading =
                false;

              state.error =
                action.payload ||
                "Failed to load attendance";
            }
          );
      },
  });

/* ============================
   ACTIONS
============================ */

export const {
  clearAttendanceError,
  resetAttendance,
} =
  attendanceSlice.actions;

/* ============================
   REDUCER
============================ */

export default attendanceSlice.reducer;