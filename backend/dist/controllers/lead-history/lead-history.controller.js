"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadHistoryController = exports.updateLeadHistoryController = exports.getLeadHistoryByIdController = exports.getLeadHistoriesController = exports.createLeadHistoryController = void 0;
const lead_history_service_1 = require("../../services/lead-history/lead-history.service");
/**
 * Create Lead History
 */
const createLeadHistoryController = async (req, res) => {
    try {
        const result = await (0, lead_history_service_1.createLeadHistory)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Lead History Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create lead history",
        });
    }
};
exports.createLeadHistoryController = createLeadHistoryController;
/**
 * Get All Lead Histories
 */
const getLeadHistoriesController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const leadId = req.query.leadId
            ? String(req.query.leadId)
            : undefined;
        const employeeId = req.query.employeeId
            ? String(req.query.employeeId)
            : undefined;
        const statusId = req.query.statusId
            ? String(req.query.statusId)
            : undefined;
        const result = await (0, lead_history_service_1.getLeadHistories)(page, limit, leadId, employeeId, statusId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead Histories Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch lead histories",
        });
    }
};
exports.getLeadHistoriesController = getLeadHistoriesController;
/**
 * Get Lead History By ID
 */
const getLeadHistoryByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_history_service_1.getLeadHistoryById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead History By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead History Not Found",
        });
    }
};
exports.getLeadHistoryByIdController = getLeadHistoryByIdController;
/**
 * Update Lead History
 */
const updateLeadHistoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_history_service_1.updateLeadHistory)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Lead History Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update lead history",
        });
    }
};
exports.updateLeadHistoryController = updateLeadHistoryController;
/**
 * Delete Lead History
 */
const deleteLeadHistoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_history_service_1.deleteLeadHistory)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Lead History Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead History Not Found",
        });
    }
};
exports.deleteLeadHistoryController = deleteLeadHistoryController;
