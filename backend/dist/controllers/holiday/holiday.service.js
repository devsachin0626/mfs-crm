"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHolidayController = exports.updateHolidayController = exports.getHolidayByIdController = exports.getHolidaysController = exports.createHolidayController = void 0;
const holiday_service_1 = require("../../services/holiday/holiday.service");
/**
 * Create Holiday
 */
const createHolidayController = async (req, res) => {
    try {
        const result = await (0, holiday_service_1.createHoliday)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Holiday Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create holiday",
        });
    }
};
exports.createHolidayController = createHolidayController;
/**
 * Get All Holidays
 */
const getHolidaysController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search
            ? String(req.query.search)
            : undefined;
        const result = await (0, holiday_service_1.getHolidays)(page, limit, search);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Holidays Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch holidays",
        });
    }
};
exports.getHolidaysController = getHolidaysController;
/**
 * Get Holiday By ID
 */
const getHolidayByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, holiday_service_1.getHolidayById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Holiday By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Holiday Not Found",
        });
    }
};
exports.getHolidayByIdController = getHolidayByIdController;
/**
 * Update Holiday
 */
const updateHolidayController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, holiday_service_1.updateHoliday)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Holiday Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update holiday",
        });
    }
};
exports.updateHolidayController = updateHolidayController;
/**
 * Delete Holiday
 */
const deleteHolidayController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, holiday_service_1.deleteHoliday)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Holiday Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Holiday Not Found",
        });
    }
};
exports.deleteHolidayController = deleteHolidayController;
