import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { getDashboardStats } from "../../services/dashboard.service";

interface DashboardState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboardStats();

      if (!response.success) {
        return rejectWithValue(
          response.message || "Failed to load dashboard"
        );
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to load dashboard"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",

  initialState,

  reducers: {
    clearDashboard: (state) => {
      state.data = null;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

  .addCase(
  fetchDashboard.pending,
  (state) => {
    state.loading = true;
    state.error = null;
    state.data = null;
  }
)

      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })

  .addCase(
  fetchDashboard.rejected,
  (state, action) => {
    state.loading = false;

    state.data = null;

    state.error =
      (action.payload as string) ||
      "Failed to load dashboard";
  }
);
  },
});

export const { clearDashboard } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;