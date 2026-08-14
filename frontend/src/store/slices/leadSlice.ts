import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { getLeads } from "../../services/lead.service";

export const fetchLeads = createAsyncThunk(
  "lead/fetchLeads",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
    }: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ) => {
    return await getLeads(page, limit, search);
  }
);

interface LeadState {
  leads: any[];
  loading: boolean;
  error: string | null;

  total: number;
  page: number;
  totalPages: number;
}

const initialState: LeadState = {
  leads: [],
  loading: false,
  error: null,

  total: 0,
  page: 1,
  totalPages: 1,
};

const leadSlice = createSlice({
  name: "lead",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchLeads.fulfilled,
        (state, action) => {
          state.loading = false;

          state.leads = action.payload.leads;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.totalPages =
            action.payload.totalPages;
        }
      )

      .addCase(
        fetchLeads.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.error.message ||
            "Failed to fetch leads";
        }
      );
  },
});

export default leadSlice.reducer;