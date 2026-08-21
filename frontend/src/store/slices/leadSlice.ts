import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import {
  getLeads,
} from "../../services/lead.service";

import type {
  Lead,
} from "../../types/lead.types";

interface LeadState {
  leads: Lead[];

  loading: boolean;

  error: string | null;

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

const initialState: LeadState = {
  leads: [],

  loading: false,

  error: null,

  total: 0,

  page: 1,

  limit: 10,

  totalPages: 1,
};

export const fetchLeads = createAsyncThunk(
  "lead/fetchLeads",
  async ({
    page = 1,
    limit = 10,
    search = "",
    status,
    source,
    stage,
    employeeId,
    followUp,
    smartView,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
    stage?: string;
    employeeId?: string;
    followUp?: "TODAY" | "OVERDUE";
    smartView?:
      | "MY_NEW"
      | "HOT"
      | "OVERDUE"
      | "UNASSIGNED"
      | "NO_FOLLOW_UP"
      | "CONVERTED"
      | "LOST";
  }) => {
    return await getLeads({
      page,
      limit,
      search,
      status,
      source,
      stage,
      employeeId,
      followUp,
      smartView,
    });
  }
);

const leadSlice =
  createSlice({
    name: "lead",

    initialState,

    reducers: {
      clearLeads: (
        state
      ) => {
        state.leads = [];

        state.loading =
          false;

        state.error =
          null;

        state.total = 0;

        state.page = 1;

        state.limit = 10;

        state.totalPages =
          1;
      },
    },

    extraReducers: (
      builder
    ) => {
      builder

        .addCase(
          fetchLeads.pending,
          (state) => {
            state.loading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          fetchLeads.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.leads =
              action.payload
                .leads || [];

            state.total =
              action.payload
                .total || 0;

            state.page =
              action.payload
                .page || 1;

            state.limit =
              action.payload
                .limit || 10;

            state.totalPages =
              action.payload
                .totalPages ||
              1;

            state.error =
              null;
          }
        )

        .addCase(
          fetchLeads.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.error =
              (action.payload as string) ||
              "Failed to fetch leads";
          }
        );
    },
  });

export const {
  clearLeads,
} = leadSlice.actions;

export default leadSlice.reducer;