"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadTrialReportController = exports.getTrialReportExportDataController = exports.getTrialReportController = exports.getClientReportExportDataController = exports.getClientReportController = exports.downloadLeadReportController = exports.getLeadReportController = exports.getReportFilterOptionsController = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const report_service_1 = require("../../services/report/report.service");
const reportExport_1 = require("../../utils/reportExport");
/* ============================
   FILTER OPTIONS
============================ */
const getReportFilterOptionsController = async (_req, res) => {
    try {
        const result = await (0, report_service_1.getReportFilterOptions)();
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Load Report Filters",
        });
    }
};
exports.getReportFilterOptionsController = getReportFilterOptionsController;
/* ============================
   LEAD REPORT
============================ */
const getLeadReportController = async (req, res) => {
    try {
        const filters = {
            page: req.query.page
                ? Number(req.query.page)
                : undefined,
            limit: req.query.limit
                ? Number(req.query.limit)
                : undefined,
            search: typeof req.query
                .search ===
                "string"
                ? req.query.search
                : undefined,
            fromDate: typeof req.query
                .fromDate ===
                "string"
                ? req.query.fromDate
                : undefined,
            toDate: typeof req.query
                .toDate ===
                "string"
                ? req.query.toDate
                : undefined,
            employeeId: typeof req.query
                .employeeId ===
                "string"
                ? req.query
                    .employeeId
                : undefined,
            status: typeof req.query
                .status ===
                "string"
                ? req.query.status
                : undefined,
            stage: typeof req.query
                .stage ===
                "string"
                ? req.query.stage
                : undefined,
            source: typeof req.query
                .source ===
                "string"
                ? req.query.source
                : undefined,
        };
        const result = await (0, report_service_1.getLeadReport)(filters);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Generate Lead Report",
        });
    }
};
exports.getLeadReportController = getLeadReportController;
/* ============================
 DOWNLOAD LEAD REPORT
 ADMIN ONLY
============================ */
const downloadLeadReportController = async (req, res) => {
    try {
        const filters = {
            search: typeof req.query.search ===
                "string"
                ? req.query.search
                : undefined,
            fromDate: typeof req.query.fromDate ===
                "string"
                ? req.query.fromDate
                : undefined,
            toDate: typeof req.query.toDate ===
                "string"
                ? req.query.toDate
                : undefined,
            employeeId: typeof req.query.employeeId ===
                "string"
                ? req.query.employeeId
                : undefined,
            status: typeof req.query.status ===
                "string"
                ? req.query.status
                : undefined,
            stage: typeof req.query.stage ===
                "string"
                ? req.query.stage
                : undefined,
            source: typeof req.query.source ===
                "string"
                ? req.query.source
                : undefined,
        };
        /* ============================
           GET ALL MATCHING RECORDS
           NO PAGINATION
        ============================ */
        const result = await (0, report_service_1.getLeadReportExportData)(filters);
        /* ============================
           GET FILTER NAMES
           FOR EXCEL HEADER
        ============================ */
        let employeeName;
        let statusName;
        let sourceName;
        if (filters.employeeId) {
            const employee = await prisma_1.default.employee.findUnique({
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
        if (filters.status) {
            const status = await prisma_1.default.leadStatus.findUnique({
                where: {
                    id: filters.status,
                },
                select: {
                    name: true,
                },
            });
            statusName =
                status?.name;
        }
        if (filters.source) {
            const source = await prisma_1.default.leadSource.findUnique({
                where: {
                    id: filters.source,
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
        const buffer = await (0, reportExport_1.createLeadExcelReport)({
            data: result.data,
            filters: {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                employeeName,
                statusName,
                stage: filters.stage,
                sourceName,
                search: filters.search,
            },
        });
        /* ============================
           FILE NAME
        ============================ */
        const date = new Date()
            .toISOString()
            .slice(0, 10);
        const fileName = `MFS-Lead-Report-${date}.xlsx`;
        /* ============================
           RESPONSE
        ============================ */
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.status(200).send(Buffer.from(buffer));
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Download Lead Report",
        });
    }
};
exports.downloadLeadReportController = downloadLeadReportController;
/* ============================
 CLIENT REPORT
============================ */
const getClientReportController = async (req, res) => {
    try {
        const filters = {
            page: req.query.page
                ? Number(req.query.page)
                : undefined,
            limit: req.query.limit
                ? Number(req.query.limit)
                : undefined,
            search: typeof req.query
                .search ===
                "string"
                ? req.query.search
                : undefined,
            fromDate: typeof req.query
                .fromDate ===
                "string"
                ? req.query.fromDate
                : undefined,
            toDate: typeof req.query
                .toDate ===
                "string"
                ? req.query.toDate
                : undefined,
            employeeId: typeof req.query
                .employeeId ===
                "string"
                ? req.query.employeeId
                : undefined,
            status: typeof req.query
                .status ===
                "string"
                ? req.query.status
                : undefined,
        };
        const result = await (0, report_service_1.getClientReport)(filters);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Generate Client Report",
        });
    }
};
exports.getClientReportController = getClientReportController;
/* ============================
   CLIENT EXPORT DATA
   TEMP JSON ENDPOINT

   Excel export next step
============================ */
const getClientReportExportDataController = async (req, res) => {
    try {
        const filters = {
            search: typeof req.query
                .search ===
                "string"
                ? req.query.search
                : undefined,
            fromDate: typeof req.query
                .fromDate ===
                "string"
                ? req.query.fromDate
                : undefined,
            toDate: typeof req.query
                .toDate ===
                "string"
                ? req.query.toDate
                : undefined,
            employeeId: typeof req.query
                .employeeId ===
                "string"
                ? req.query.employeeId
                : undefined,
            status: typeof req.query
                .status ===
                "string"
                ? req.query.status
                : undefined,
        };
        const result = await (0, report_service_1.getClientReportExportData)(filters);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Prepare Client Report Export",
        });
    }
};
exports.getClientReportExportDataController = getClientReportExportDataController;
/* ============================
 TRIAL / DEMO REPORT
============================ */
const getTrialReportController = async (req, res) => {
    try {
        const filters = {
            page: req.query.page
                ? Number(req.query.page)
                : undefined,
            limit: req.query.limit
                ? Number(req.query.limit)
                : undefined,
            search: typeof req.query
                .search ===
                "string"
                ? req.query.search
                : undefined,
            fromDate: typeof req.query
                .fromDate ===
                "string"
                ? req.query.fromDate
                : undefined,
            toDate: typeof req.query
                .toDate ===
                "string"
                ? req.query.toDate
                : undefined,
            employeeId: typeof req.query
                .employeeId ===
                "string"
                ? req.query.employeeId
                : undefined,
            trialStatus: typeof req.query
                .trialStatus ===
                "string"
                ? req.query.trialStatus
                : undefined,
            productId: typeof req.query
                .productId ===
                "string"
                ? req.query.productId
                : undefined,
        };
        const result = await (0, report_service_1.getTrialReport)(filters);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Generate Trial Report",
        });
    }
};
exports.getTrialReportController = getTrialReportController;
/* ============================
   TRIAL EXPORT DATA
   TEMP JSON ENDPOINT
============================ */
const getTrialReportExportDataController = async (req, res) => {
    try {
        const filters = {
            search: typeof req.query
                .search ===
                "string"
                ? req.query.search
                : undefined,
            fromDate: typeof req.query
                .fromDate ===
                "string"
                ? req.query.fromDate
                : undefined,
            toDate: typeof req.query
                .toDate ===
                "string"
                ? req.query.toDate
                : undefined,
            employeeId: typeof req.query
                .employeeId ===
                "string"
                ? req.query.employeeId
                : undefined,
            trialStatus: typeof req.query
                .trialStatus ===
                "string"
                ? req.query.trialStatus
                : undefined,
            productId: typeof req.query
                .productId ===
                "string"
                ? req.query.productId
                : undefined,
        };
        const result = await (0, report_service_1.getTrialReportExportData)(filters);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Prepare Trial Report Export",
        });
    }
};
exports.getTrialReportExportDataController = getTrialReportExportDataController;
/* ============================
 DOWNLOAD TRIAL REPORT
============================ */
const downloadTrialReportController = async (req, res) => {
    try {
        const filters = {
            search: typeof req.query.search === "string"
                ? req.query.search
                : undefined,
            fromDate: typeof req.query.fromDate === "string"
                ? req.query.fromDate
                : undefined,
            toDate: typeof req.query.toDate === "string"
                ? req.query.toDate
                : undefined,
            employeeId: typeof req.query.employeeId === "string"
                ? req.query.employeeId
                : undefined,
            trialStatus: typeof req.query.trialStatus === "string"
                ? req.query.trialStatus
                : undefined,
            productId: typeof req.query.productId === "string"
                ? req.query.productId
                : undefined,
        };
        /* ============================
           GET ALL MATCHING TRIALS
        ============================ */
        const result = await (0, report_service_1.getTrialReportExportData)(filters);
        /* ============================
           FILTER DISPLAY NAMES
        ============================ */
        let employeeName;
        let productName;
        if (filters.employeeId) {
            const employee = await prisma_1.default.employee.findUnique({
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
            const product = await prisma_1.default.product.findUnique({
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
        const buffer = await (0, reportExport_1.createTrialExcelReport)({
            data: result.data,
            filters: {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                employeeName,
                trialStatus: filters.trialStatus,
                productName,
                search: filters.search,
            },
        });
        /* ============================
           FILE NAME
        ============================ */
        const date = new Date()
            .toISOString()
            .slice(0, 10);
        const fileName = `MFS-Trial-Report-${date}.xlsx`;
        /* ============================
           RESPONSE
        ============================ */
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.status(200).send(Buffer.from(buffer));
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error?.message ||
                "Failed To Download Trial Report",
        });
    }
};
exports.downloadTrialReportController = downloadTrialReportController;
