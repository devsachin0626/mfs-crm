"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculatePayrollController = exports.previewPayrollController = exports.updatePayrollController = exports.getPayrollByIdController = exports.getPayrollsController = exports.createPayrollController = void 0;
const payroll_service_1 = require("../../services/payroll/payroll.service");
/* ============================
   CREATE PAYROLL
============================ */
const createPayrollController = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await (0, payroll_service_1.createPayroll)(req.body, req.employee);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Payroll Error:", error);
        res.status(400).json({
            success: false,
            message: error.message ||
                "Failed to create payroll",
        });
    }
};
exports.createPayrollController = createPayrollController;
/* ============================
   GET PAYROLLS
============================ */
const getPayrollsController = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = typeof req.query
            .search === "string"
            ? req.query.search
            : undefined;
        const employeeId = typeof req.query
            .employeeId ===
            "string"
            ? req.query
                .employeeId
            : undefined;
        const month = req.query.month
            ? Number(req.query.month)
            : undefined;
        const year = req.query.year
            ? Number(req.query.year)
            : undefined;
        const status = typeof req.query
            .status === "string"
            ? req.query
                .status
            : undefined;
        const result = await (0, payroll_service_1.getPayrolls)(page, limit, search, month, year, status, employeeId, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Payrolls Error:", error);
        res.status(400).json({
            success: false,
            message: error.message ||
                "Failed to fetch payrolls",
        });
    }
};
exports.getPayrollsController = getPayrollsController;
/* ============================
   GET PAYROLL BY ID
============================ */
const getPayrollByIdController = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = req.params.id;
        const result = await (0, payroll_service_1.getPayrollById)(id, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Payroll By ID Error:", error);
        res.status(404).json({
            success: false,
            message: error.message ||
                "Payroll Not Found",
        });
    }
};
exports.getPayrollByIdController = getPayrollByIdController;
/* ============================
   UPDATE PAYROLL
============================ */
const updatePayrollController = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = req.params.id;
        const result = await (0, payroll_service_1.updatePayroll)(id, req.body, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Payroll Error:", error);
        res.status(400).json({
            success: false,
            message: error.message ||
                "Failed to update payroll",
        });
    }
};
exports.updatePayrollController = updatePayrollController;
/* ============================
 PAYROLL PREVIEW
============================ */
const previewPayrollController = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const { employeeId, month, year, incentive, bonus, deduction, } = req.body;
        if (!employeeId) {
            res.status(400).json({
                success: false,
                message: "Employee is required",
            });
            return;
        }
        const result = await (0, payroll_service_1.previewPayroll)(employeeId, Number(month), Number(year), Number(incentive || 0), Number(bonus || 0), Number(deduction || 0), req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Payroll Preview Failed",
        });
    }
};
exports.previewPayrollController = previewPayrollController;
/* ============================
 RECALCULATE PAYROLL
============================ */
const recalculatePayrollController = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = String(req.params.id ||
            "").trim();
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Payroll ID is required",
            });
            return;
        }
        const result = await (0, payroll_service_1.recalculatePayroll)(id, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Payroll Recalculation Failed",
        });
    }
};
exports.recalculatePayrollController = recalculatePayrollController;
