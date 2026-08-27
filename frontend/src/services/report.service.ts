import api from "./api";

import type {
  ClientReportResponse,
  LeadReportResponse,
  ReportFilterOptionsResponse,
  ReportFilters,
  TrialReportResponse
} from "../types/report.types";

/* ============================
   GET FILTER OPTIONS
============================ */

export const getReportFilterOptions =
  async (): Promise<ReportFilterOptionsResponse> => {
    const response =
      await api.get<ReportFilterOptionsResponse>(
        "/reports/filters"
      );

    return response.data;
  };

/* ============================
   GET LEAD REPORT
============================ */

export const getLeadReport =
  async (
    filters: ReportFilters = {}
  ): Promise<LeadReportResponse> => {
    const response =
      await api.get<LeadReportResponse>(
        "/reports/leads",
        {
          params: {
            page:
              filters.page ??
              1,

            limit:
              filters.limit ??
              20,

            search:
              filters.search
                ?.trim() ||
              undefined,

            fromDate:
              filters.fromDate ||
              undefined,

            toDate:
              filters.toDate ||
              undefined,

            employeeId:
              filters.employeeId ||
              undefined,

            status:
              filters.status ||
              undefined,

            stage:
              filters.stage ||
              undefined,

            source:
              filters.source ||
              undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   DOWNLOAD LEAD EXCEL
============================ */

export const downloadLeadReport =
  async (
    filters: ReportFilters = {}
  ): Promise<void> => {
    const response =
      await api.get(
        "/reports/leads/export",
        {
          params: {
            search:
              filters.search
                ?.trim() ||
              undefined,

            fromDate:
              filters.fromDate ||
              undefined,

            toDate:
              filters.toDate ||
              undefined,

            employeeId:
              filters.employeeId ||
              undefined,

            status:
              filters.status ||
              undefined,

            stage:
              filters.stage ||
              undefined,

            source:
              filters.source ||
              undefined,
          },

          responseType:
            "blob",
        }
      );

    /* ============================
       FILE NAME
    ============================ */

    const disposition =
      response.headers[
        "content-disposition"
      ];

    let fileName =
      "MFS-Lead-Report.xlsx";

    if (
      typeof disposition ===
      "string"
    ) {
      const match =
        disposition.match(
          /filename="?([^"]+)"?/i
        );

      if (
        match?.[1]
      ) {
        fileName =
          match[1];
      }
    }

    /* ============================
       DOWNLOAD
    ============================ */

    const blob =
      new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      fileName;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );
  };

  /* ============================
   GET CLIENT REPORT
============================ */

export const getClientReport =
  async (
    filters: ReportFilters = {}
  ): Promise<ClientReportResponse> => {
    const response =
      await api.get<ClientReportResponse>(
        "/reports/clients",
        {
          params: {
            page:
              filters.page ??
              1,

            limit:
              filters.limit ??
              20,

            search:
              filters.search
                ?.trim() ||
              undefined,

            fromDate:
              filters.fromDate ||
              undefined,

            toDate:
              filters.toDate ||
              undefined,

            employeeId:
              filters.employeeId ||
              undefined,

            status:
              filters.status ||
              undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   DOWNLOAD CLIENT EXCEL
============================ */

export const downloadClientReport =
  async (
    filters: ReportFilters = {}
  ): Promise<void> => {
    const response =
      await api.get(
        "/reports/clients/export",
        {
          params: {
            search:
              filters.search
                ?.trim() ||
              undefined,

            fromDate:
              filters.fromDate ||
              undefined,

            toDate:
              filters.toDate ||
              undefined,

            employeeId:
              filters.employeeId ||
              undefined,

            status:
              filters.status ||
              undefined,
          },

          responseType:
            "blob",
        }
      );

    /* ============================
       FILE NAME
    ============================ */

    const disposition =
      response.headers[
        "content-disposition"
      ];

    let fileName =
      "MFS-Client-Report.xlsx";

    if (
      typeof disposition ===
      "string"
    ) {
      const match =
        disposition.match(
          /filename="?([^"]+)"?/i
        );

      if (match?.[1]) {
        fileName =
          match[1];
      }
    }

    /* ============================
       DOWNLOAD FILE
    ============================ */

    const blob =
      new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      fileName;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );
  };

  /* ============================
   GET TRIAL REPORT
============================ */

export const getTrialReport =
  async (
    filters: ReportFilters = {}
  ): Promise<TrialReportResponse> => {
    const response =
      await api.get<TrialReportResponse>(
        "/reports/trials",
        {
          params: {
            page:
              filters.page ??
              1,

            limit:
              filters.limit ??
              20,

            search:
              filters.search
                ?.trim() ||
              undefined,

            fromDate:
              filters.fromDate ||
              undefined,

            toDate:
              filters.toDate ||
              undefined,

            employeeId:
              filters.employeeId ||
              undefined,

            trialStatus:
              filters.trialStatus ||
              undefined,

            productId:
              filters.productId ||
              undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   DOWNLOAD TRIAL EXCEL
============================ */

export const downloadTrialReport =
  async (
    filters: ReportFilters = {}
  ): Promise<void> => {
    const response =
      await api.get(
        "/reports/trials/export",
        {
          params: {
            search:
              filters.search
                ?.trim() ||
              undefined,

            fromDate:
              filters.fromDate ||
              undefined,

            toDate:
              filters.toDate ||
              undefined,

            employeeId:
              filters.employeeId ||
              undefined,

            trialStatus:
              filters.trialStatus ||
              undefined,

            productId:
              filters.productId ||
              undefined,
          },

          responseType: "blob",
        }
      );

    const disposition =
      response.headers[
        "content-disposition"
      ];

    let fileName =
      "MFS-Trial-Report.xlsx";

    if (
      typeof disposition ===
      "string"
    ) {
      const match =
        disposition.match(
          /filename="?([^"]+)"?/i
        );

      if (match?.[1]) {
        fileName =
          match[1];
      }
    }

    const blob =
      new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      fileName;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );
  };