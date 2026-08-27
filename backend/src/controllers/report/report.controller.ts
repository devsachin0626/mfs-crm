import {
  Request,
  Response,
} from "express";

import prisma from "../../config/prisma";

import {
  getClientReport,
  getClientReportExportData,
  getLeadReport,
  getLeadReportExportData,
  getReportFilterOptions,
  getTrialReport,
getTrialReportExportData,
} from "../../services/report/report.service";
import {
  createClientExcelReport,
  createLeadExcelReport,
  createTrialExcelReport,
} from "../../utils/reportExport";

/* ============================
   FILTER OPTIONS
============================ */

export const getReportFilterOptionsController =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result =
        await getReportFilterOptions();

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Load Report Filters",
      });
    }
  };

/* ============================
   LEAD REPORT
============================ */

export const getLeadReportController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters = {
        page:
          req.query.page
            ? Number(
                req.query.page
              )
            : undefined,

        limit:
          req.query.limit
            ? Number(
                req.query.limit
              )
            : undefined,

        search:
          typeof req.query
            .search ===
          "string"
            ? req.query.search
            : undefined,

        fromDate:
          typeof req.query
            .fromDate ===
          "string"
            ? req.query.fromDate
            : undefined,

        toDate:
          typeof req.query
            .toDate ===
          "string"
            ? req.query.toDate
            : undefined,

        employeeId:
          typeof req.query
            .employeeId ===
          "string"
            ? req.query
                .employeeId
            : undefined,

        status:
          typeof req.query
            .status ===
          "string"
            ? req.query.status
            : undefined,

        stage:
          typeof req.query
            .stage ===
          "string"
            ? req.query.stage
            : undefined,

        source:
          typeof req.query
            .source ===
          "string"
            ? req.query.source
            : undefined,
      };

      const result =
        await getLeadReport(
          filters
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Generate Lead Report",
      });
    }
  };


  /* ============================
   DOWNLOAD LEAD REPORT
   ADMIN ONLY
============================ */

export const downloadLeadReportController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters = {
        search:
          typeof req.query.search ===
          "string"
            ? req.query.search
            : undefined,

        fromDate:
          typeof req.query.fromDate ===
          "string"
            ? req.query.fromDate
            : undefined,

        toDate:
          typeof req.query.toDate ===
          "string"
            ? req.query.toDate
            : undefined,

        employeeId:
          typeof req.query.employeeId ===
          "string"
            ? req.query.employeeId
            : undefined,

        status:
          typeof req.query.status ===
          "string"
            ? req.query.status
            : undefined,

        stage:
          typeof req.query.stage ===
          "string"
            ? req.query.stage
            : undefined,

        source:
          typeof req.query.source ===
          "string"
            ? req.query.source
            : undefined,
      };

      /* ============================
         GET ALL MATCHING RECORDS
         NO PAGINATION
      ============================ */

      const result =
        await getLeadReportExportData(
          filters
        );

      /* ============================
         GET FILTER NAMES
         FOR EXCEL HEADER
      ============================ */

      let employeeName:
        | string
        | undefined;

      let statusName:
        | string
        | undefined;

      let sourceName:
        | string
        | undefined;

      if (filters.employeeId) {
        const employee =
          await prisma.employee.findUnique({
            where: {
              id:
                filters.employeeId,
            },

            select: {
              name: true,

              employeeCode:
                true,
            },
          });

        if (employee) {
          employeeName =
            `${employee.name} (${employee.employeeCode})`;
        }
      }

      if (filters.status) {
        const status =
          await prisma.leadStatus.findUnique({
            where: {
              id:
                filters.status,
            },

            select: {
              name: true,
            },
          });

        statusName =
          status?.name;
      }

      if (filters.source) {
        const source =
          await prisma.leadSource.findUnique({
            where: {
              id:
                filters.source,
            },

            select: {
              name: true,
            },
          });

        sourceName =
          source?.name;
      }

      /* ============================
         CREATE EXCEL
      ============================ */

      const buffer =
        await createLeadExcelReport({
          data:
            result.data,

          filters: {
            fromDate:
              filters.fromDate,

            toDate:
              filters.toDate,

            employeeName,

            statusName,

            stage:
              filters.stage,

            sourceName,

            search:
              filters.search,
          },
        });

      /* ============================
         FILE NAME
      ============================ */

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      const fileName =
        `MFS-Lead-Report-${date}.xlsx`;

      /* ============================
         RESPONSE
      ============================ */

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.status(200).send(
        Buffer.from(buffer)
      );
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Download Lead Report",
      });
    }
  };

  /* ============================
   CLIENT REPORT
============================ */

export const getClientReportController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters = {
        page:
          req.query.page
            ? Number(
                req.query.page
              )
            : undefined,

        limit:
          req.query.limit
            ? Number(
                req.query.limit
              )
            : undefined,

        search:
          typeof req.query
            .search ===
          "string"
            ? req.query.search
            : undefined,

        fromDate:
          typeof req.query
            .fromDate ===
          "string"
            ? req.query.fromDate
            : undefined,

        toDate:
          typeof req.query
            .toDate ===
          "string"
            ? req.query.toDate
            : undefined,

        employeeId:
          typeof req.query
            .employeeId ===
          "string"
            ? req.query.employeeId
            : undefined,

        status:
          typeof req.query
            .status ===
          "string"
            ? req.query.status
            : undefined,
      };

      const result =
        await getClientReport(
          filters
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Generate Client Report",
      });
    }
  };

/* ============================
   CLIENT EXPORT DATA
   TEMP JSON ENDPOINT

   Excel export next step
============================ */

export const getClientReportExportDataController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters = {
        search:
          typeof req.query
            .search ===
          "string"
            ? req.query.search
            : undefined,

        fromDate:
          typeof req.query
            .fromDate ===
          "string"
            ? req.query.fromDate
            : undefined,

        toDate:
          typeof req.query
            .toDate ===
          "string"
            ? req.query.toDate
            : undefined,

        employeeId:
          typeof req.query
            .employeeId ===
          "string"
            ? req.query.employeeId
            : undefined,

        status:
          typeof req.query
            .status ===
          "string"
            ? req.query.status
            : undefined,
      };

      const result =
        await getClientReportExportData(
          filters
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Prepare Client Report Export",
      });
    }
  };

  /* ============================
   TRIAL / DEMO REPORT
============================ */

export const getTrialReportController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters = {
        page:
          req.query.page
            ? Number(
                req.query.page
              )
            : undefined,

        limit:
          req.query.limit
            ? Number(
                req.query.limit
              )
            : undefined,

        search:
          typeof req.query
            .search ===
          "string"
            ? req.query.search
            : undefined,

        fromDate:
          typeof req.query
            .fromDate ===
          "string"
            ? req.query.fromDate
            : undefined,

        toDate:
          typeof req.query
            .toDate ===
          "string"
            ? req.query.toDate
            : undefined,

        employeeId:
          typeof req.query
            .employeeId ===
          "string"
            ? req.query.employeeId
            : undefined,

        trialStatus:
          typeof req.query
            .trialStatus ===
          "string"
            ? req.query.trialStatus
            : undefined,

        productId:
          typeof req.query
            .productId ===
          "string"
            ? req.query.productId
            : undefined,
      };

      const result =
        await getTrialReport(
          filters
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Generate Trial Report",
      });
    }
  };

/* ============================
   TRIAL EXPORT DATA
   TEMP JSON ENDPOINT
============================ */

export const getTrialReportExportDataController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters = {
        search:
          typeof req.query
            .search ===
          "string"
            ? req.query.search
            : undefined,

        fromDate:
          typeof req.query
            .fromDate ===
          "string"
            ? req.query.fromDate
            : undefined,

        toDate:
          typeof req.query
            .toDate ===
          "string"
            ? req.query.toDate
            : undefined,

        employeeId:
          typeof req.query
            .employeeId ===
          "string"
            ? req.query.employeeId
            : undefined,

        trialStatus:
          typeof req.query
            .trialStatus ===
          "string"
            ? req.query.trialStatus
            : undefined,

        productId:
          typeof req.query
            .productId ===
          "string"
            ? req.query.productId
            : undefined,
      };

      const result =
        await getTrialReportExportData(
          filters
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Prepare Trial Report Export",
      });
    }
  };

  /* ============================
   DOWNLOAD TRIAL REPORT
============================ */

export const downloadTrialReportController =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters = {
        search:
          typeof req.query.search === "string"
            ? req.query.search
            : undefined,

        fromDate:
          typeof req.query.fromDate === "string"
            ? req.query.fromDate
            : undefined,

        toDate:
          typeof req.query.toDate === "string"
            ? req.query.toDate
            : undefined,

        employeeId:
          typeof req.query.employeeId === "string"
            ? req.query.employeeId
            : undefined,

        trialStatus:
          typeof req.query.trialStatus === "string"
            ? req.query.trialStatus
            : undefined,

        productId:
          typeof req.query.productId === "string"
            ? req.query.productId
            : undefined,
      };

      /* ============================
         GET ALL MATCHING TRIALS
      ============================ */

      const result =
        await getTrialReportExportData(
          filters
        );

      /* ============================
         FILTER DISPLAY NAMES
      ============================ */

      let employeeName:
        | string
        | undefined;

      let productName:
        | string
        | undefined;

      if (filters.employeeId) {
        const employee =
          await prisma.employee.findUnique({
            where: {
              id: filters.employeeId,
            },

            select: {
              name: true,
              employeeCode: true,
            },
          });

        if (employee) {
          employeeName =
            `${employee.name} (${employee.employeeCode})`;
        }
      }

      if (filters.productId) {
        const product =
          await prisma.product.findUnique({
            where: {
              id: filters.productId,
            },

            select: {
              name: true,
              productCode: true,
            },
          });

        if (product) {
          productName =
            `${product.name} (${product.productCode})`;
        }
      }

      /* ============================
         CREATE EXCEL
      ============================ */

      const buffer =
        await createTrialExcelReport({
          data: result.data,

          filters: {
            fromDate:
              filters.fromDate,

            toDate:
              filters.toDate,

            employeeName,

            trialStatus:
              filters.trialStatus,

            productName,

            search:
              filters.search,
          },
        });

      /* ============================
         FILE NAME
      ============================ */

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      const fileName =
        `MFS-Trial-Report-${date}.xlsx`;

      /* ============================
         RESPONSE
      ============================ */

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.status(200).send(
        Buffer.from(buffer)
      );
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error?.message ||
          "Failed To Download Trial Report",
      });
    }
  };