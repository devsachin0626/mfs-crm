import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import type {
  PayloadAction,
} from "@reduxjs/toolkit";

import {
  downloadClientReport,
  downloadLeadReport,
  downloadTrialReport,
  getClientReport,
  getLeadReport,
  getReportFilterOptions,
  getTrialReport,
} from "../../services/report.service";

import type {
  ClientReportResponse,
  LeadReportResponse,
  ReportFilterOptions,
  ReportFilters,
  ReportState,
  TrialReportResponse,
} from "../../types/report.types";

import {
  DEFAULT_REPORT_FILTERS,
} from "../../types/report.types";

/* ============================
   INITIAL STATE
============================ */

const initialState: ReportState = {
  filterOptions: null,

  leadReport: null,

  clientReport: null,

  trialReport: null,

  filters: {
    ...DEFAULT_REPORT_FILTERS,
  },

  loading: false,

  filtersLoading: false,

  downloading: false,

  error: null,
};

/* ============================
   FETCH FILTER OPTIONS
============================ */

export const fetchReportFilterOptions =
  createAsyncThunk<
    ReportFilterOptions,
    void,
    {
      rejectValue: string;
    }
  >(
    "report/fetchFilterOptions",

    async (
      _,
      {
        rejectWithValue,
      }
    ) => {
      try {
        const response =
          await getReportFilterOptions();

        if (!response.success) {
          return rejectWithValue(
            "Failed To Load Report Filters"
          );
        }

        return response.filters;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Load Report Filters"
        );
      }
    }
  );

/* ============================
   FETCH LEAD REPORT
============================ */

export const fetchLeadReport =
  createAsyncThunk<
    LeadReportResponse,
    ReportFilters | undefined,
    {
      rejectValue: string;
    }
  >(
    "report/fetchLeadReport",

    async (
      filters,
      {
        rejectWithValue,
      }
    ) => {
      try {
        const response =
          await getLeadReport(
            filters || {}
          );

        if (!response.success) {
          return rejectWithValue(
            "Failed To Load Lead Report"
          );
        }

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Load Lead Report"
        );
      }
    }
  );

/* ============================
   FETCH CLIENT REPORT
============================ */

export const fetchClientReport =
  createAsyncThunk<
    ClientReportResponse,
    ReportFilters | undefined,
    {
      rejectValue: string;
    }
  >(
    "report/fetchClientReport",

    async (
      filters,
      {
        rejectWithValue,
      }
    ) => {
      try {
        const response =
          await getClientReport(
            filters || {}
          );

        if (!response.success) {
          return rejectWithValue(
            "Failed To Load Client Report"
          );
        }

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Load Client Report"
        );
      }
    }
  );

/* ============================
   FETCH TRIAL REPORT
============================ */

export const fetchTrialReport =
  createAsyncThunk<
    TrialReportResponse,
    ReportFilters | undefined,
    {
      rejectValue: string;
    }
  >(
    "report/fetchTrialReport",

    async (
      filters,
      {
        rejectWithValue,
      }
    ) => {
      try {
        const response =
          await getTrialReport(
            filters || {}
          );

        if (!response.success) {
          return rejectWithValue(
            "Failed To Load Trial Report"
          );
        }

        return response;
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Load Trial Report"
        );
      }
    }
  );

/* ============================
   DOWNLOAD LEAD REPORT
============================ */

export const exportLeadReport =
  createAsyncThunk<
    void,
    ReportFilters | undefined,
    {
      rejectValue: string;
    }
  >(
    "report/exportLeadReport",

    async (
      filters,
      {
        rejectWithValue,
      }
    ) => {
      try {
        await downloadLeadReport(
          filters || {}
        );
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Download Lead Report"
        );
      }
    }
  );

/* ============================
   DOWNLOAD CLIENT REPORT
============================ */

export const exportClientReport =
  createAsyncThunk<
    void,
    ReportFilters | undefined,
    {
      rejectValue: string;
    }
  >(
    "report/exportClientReport",

    async (
      filters,
      {
        rejectWithValue,
      }
    ) => {
      try {
        await downloadClientReport(
          filters || {}
        );
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Download Client Report"
        );
      }
    }
  );

/* ============================
   DOWNLOAD TRIAL REPORT
============================ */

export const exportTrialReport =
  createAsyncThunk<
    void,
    ReportFilters | undefined,
    {
      rejectValue: string;
    }
  >(
    "report/exportTrialReport",

    async (
      filters,
      {
        rejectWithValue,
      }
    ) => {
      try {
        await downloadTrialReport(
          filters || {}
        );
      } catch (error: any) {
        return rejectWithValue(
          error?.response?.data
            ?.message ||
            "Failed To Download Trial Report"
        );
      }
    }
  );

/* ============================
   SLICE
============================ */

const reportSlice =
  createSlice({
    name: "report",

    initialState,

    reducers: {
      /* ============================
         SET FILTERS
      ============================ */

      setReportFilters: (
        state,
        action: PayloadAction<
          Partial<ReportFilters>
        >
      ) => {
        state.filters = {
          ...state.filters,
          ...action.payload,
        };
      },

      /* ============================
         SET PAGE
      ============================ */

      setReportPage: (
        state,
        action: PayloadAction<number>
      ) => {
        state.filters.page =
          action.payload;
      },

      /* ============================
         RESET FILTERS
      ============================ */

      resetReportFilters: (
        state
      ) => {
        state.filters = {
          ...DEFAULT_REPORT_FILTERS,
        };
      },

      /* ============================
         CLEAR ERROR
      ============================ */

      clearReportError: (
        state
      ) => {
        state.error = null;
      },

      /* ============================
         CLEAR LEAD REPORT
      ============================ */

      clearLeadReport: (
        state
      ) => {
        state.leadReport =
          null;
      },

      /* ============================
         CLEAR CLIENT REPORT
      ============================ */

      clearClientReport: (
        state
      ) => {
        state.clientReport =
          null;
      },

      /* ============================
         CLEAR TRIAL REPORT
      ============================ */

      clearTrialReport: (
        state
      ) => {
        state.trialReport =
          null;
      },

      /* ============================
         CLEAR ALL REPORT DATA
      ============================ */

      clearReportData: (
        state
      ) => {
        state.leadReport =
          null;

        state.clientReport =
          null;

        state.trialReport =
          null;

        state.error =
          null;
      },
    },

    extraReducers: (
      builder
    ) => {
      /* ============================
         FILTER OPTIONS
      ============================ */

      builder
        .addCase(
          fetchReportFilterOptions.pending,
          (
            state
          ) => {
            state.filtersLoading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          fetchReportFilterOptions.fulfilled,
          (
            state,
            action
          ) => {
            state.filtersLoading =
              false;

            state.filterOptions =
              action.payload;

            state.error =
              null;
          }
        )

        .addCase(
          fetchReportFilterOptions.rejected,
          (
            state,
            action
          ) => {
            state.filtersLoading =
              false;

            state.error =
              action.payload ||
              "Failed To Load Report Filters";
          }
        );

      /* ============================
         LEAD REPORT
      ============================ */

      builder
        .addCase(
          fetchLeadReport.pending,
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
          fetchLeadReport.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.leadReport =
              action.payload;

            state.error =
              null;
          }
        )

        .addCase(
          fetchLeadReport.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.leadReport =
              null;

            state.error =
              action.payload ||
              "Failed To Load Lead Report";
          }
        );

      /* ============================
         CLIENT REPORT
      ============================ */

      builder
        .addCase(
          fetchClientReport.pending,
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
          fetchClientReport.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.clientReport =
              action.payload;

            state.error =
              null;
          }
        )

        .addCase(
          fetchClientReport.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.clientReport =
              null;

            state.error =
              action.payload ||
              "Failed To Load Client Report";
          }
        );

      /* ============================
         TRIAL REPORT
      ============================ */

      builder
        .addCase(
          fetchTrialReport.pending,
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
          fetchTrialReport.fulfilled,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.trialReport =
              action.payload;

            state.error =
              null;
          }
        )

        .addCase(
          fetchTrialReport.rejected,
          (
            state,
            action
          ) => {
            state.loading =
              false;

            state.trialReport =
              null;

            state.error =
              action.payload ||
              "Failed To Load Trial Report";
          }
        );

      /* ============================
         LEAD EXPORT
      ============================ */

      builder
        .addCase(
          exportLeadReport.pending,
          (
            state
          ) => {
            state.downloading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          exportLeadReport.fulfilled,
          (
            state
          ) => {
            state.downloading =
              false;

            state.error =
              null;
          }
        )

        .addCase(
          exportLeadReport.rejected,
          (
            state,
            action
          ) => {
            state.downloading =
              false;

            state.error =
              action.payload ||
              "Failed To Download Lead Report";
          }
        );

      /* ============================
         CLIENT EXPORT
      ============================ */

      builder
        .addCase(
          exportClientReport.pending,
          (
            state
          ) => {
            state.downloading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          exportClientReport.fulfilled,
          (
            state
          ) => {
            state.downloading =
              false;

            state.error =
              null;
          }
        )

        .addCase(
          exportClientReport.rejected,
          (
            state,
            action
          ) => {
            state.downloading =
              false;

            state.error =
              action.payload ||
              "Failed To Download Client Report";
          }
        );

      /* ============================
         TRIAL EXPORT
      ============================ */

      builder
        .addCase(
          exportTrialReport.pending,
          (
            state
          ) => {
            state.downloading =
              true;

            state.error =
              null;
          }
        )

        .addCase(
          exportTrialReport.fulfilled,
          (
            state
          ) => {
            state.downloading =
              false;

            state.error =
              null;
          }
        )

        .addCase(
          exportTrialReport.rejected,
          (
            state,
            action
          ) => {
            state.downloading =
              false;

            state.error =
              action.payload ||
              "Failed To Download Trial Report";
          }
        );
    },
  });

/* ============================
   EXPORT ACTIONS
============================ */

export const {
  setReportFilters,
  setReportPage,
  resetReportFilters,
  clearReportError,
  clearLeadReport,
  clearClientReport,
  clearTrialReport,
  clearReportData,
} =
  reportSlice.actions;

/* ============================
   REDUCER
============================ */

export default
reportSlice.reducer;