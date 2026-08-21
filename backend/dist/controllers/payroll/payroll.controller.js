"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePayrollController = exports.getPayrollByIdController = exports.getPayrollsController = exports.createPayrollController = void 0;
const payroll_service_1 = require("../../services/payroll/payroll.service");
/**
 * Create Payroll
 */
const createPayrollController = async (req, res) => {
    try {
        const payroll = await (0, payroll_service_1.createPayroll)(req.body);
        return res.status(201).json(payroll);
    }
    catch (error) {
        console.error("Create Payroll Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create payroll",
        });
    }
};
exports.createPayrollController = createPayrollController;
/**
 * Get All Payrolls
 */
const getPayrollsController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search
            ? String(req.query.search)
            : undefined;
        const employeeId = typeof req.query.employeeId === "string"
            ? req.query.employeeId
            : undefined;
        const month = req.query.month
            ? Number(req.query.month)
            : undefined;
        const year = req.query.year
            ? Number(req.query.year)
            : undefined;
        const status = req.query.status
            ? String(req.query.status)
            : undefined;
        const result = await (0, payroll_service_1.getPayrolls)(page, limit, search, month, year, status, employeeId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Payrolls Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch payrolls",
        });
    }
};
exports.getPayrollsController = getPayrollsController;
/**
 * Get Payroll By ID
 */
const getPayrollByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, payroll_service_1.getPayrollById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Payroll By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Payroll Not Found",
        });
    }
};
exports.getPayrollByIdController = getPayrollByIdController;
/**
 * Update Payroll
 */
const updatePayrollController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, payroll_service_1.updatePayroll)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Payroll Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update payroll",
        });
    }
};
exports.updatePayrollController = updatePayrollController;
