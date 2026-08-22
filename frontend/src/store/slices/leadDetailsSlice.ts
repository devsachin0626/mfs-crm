import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { getLeadById } from "../../services/lead-details.service";

export const fetchLeadDetails =
  createAsyncThunk(
    "leadDetails/fetchLeadDetails",
    async (id: string) => {
      return await getLeadById(id);
    }
  );

interface LeadDetailsState {
  lead: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeadDetailsState = {
  lead: null,
  loading: false,
  error: null,
};

const leadDetailsSlice = createSlice({
  name: "leadDetails",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(
        fetchLeadDetails.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchLeadDetails.fulfilled,
        (state, action) => {
          state.loading = false;
          state.lead = action.payload.lead;
        }
      )

      .addCase(
        fetchLeadDetails.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ||
            "Failed to fetch lead";
        }
      );
  },
});

export default leadDetailsSlice.reducer;