import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getTrials,
} from "../../services/trial.service";

import type {
  Trial,
  TrialListParams,
  TrialListResponse,
} from "../../types/trial.types";

/* ============================
   STATE
============================ */

interface TrialState {
  trials: Trial[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  loading: boolean;

  error: string | null;
}

const initialState: TrialState = {
  trials: [],

  total: 0,

  page: 1,

  limit: 10,

  totalPages: 0,

  loading: false,

  error: null,
};

/* ============================
   FETCH TRIALS
============================ */

export const fetchTrials =
  createAsyncThunk<
    TrialListResponse,
    TrialListParams | undefined,
    {
      rejectValue: string;
    }
  >(
    "trial/fetchTrials",

    async (
      params,
      {
        rejectWithValue,
      }
    ) => {
      try {
        const response =
          await getTrials(
            params || {}
          );

        if (
          !response.success
        ) {
          return rejectWithValue(
            "Failed To Load Trials"
          );
        }

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Load Trials"
        );
      }
    }
  );

/* ============================
   SLICE
============================ */

const trialSlice =
  createSlice({
    name: "trial",

    initialState,

    reducers: {
      clearTrials: (
        state
      ) => {
        state.trials = [];

        state.total = 0;

        state.page = 1;

        state.limit = 10;

        state.totalPages =
          0;

        state.loading =
          false;

        state.error =
          null;
      },

      clearTrialError: (
        state
      ) => {
        state.error =
          null;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder
        .addCase(
          fetchTrials.pending,
          (state) => {
            state.loading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          fetchTrials.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              null;

            state.trials =
              action.payload
                .trials ||
              [];

            state.total =
              action.payload
                .total ||
              0;

            state.page =
              action.payload
                .page ||
              1;

            state.limit =
              action.payload
                .limit ||
              10;

            state.totalPages =
              action.payload
                .totalPages ||
              0;
          }
        )

        .addCase(
          fetchTrials.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              action.payload ||
              "Failed To Load Trials";

            /*
             * Old role/user ka
             * stale trial data
             * screen par nahi rehna chahiye.
             */

            state.trials =
              [];

            state.total = 0;

            state.totalPages =
              0;
          }
        );
    },
  });

/* ============================
   EXPORTS
============================ */

export const {
  clearTrials,
  clearTrialError,
} =
  trialSlice.actions;

export default
trialSlice.reducer;