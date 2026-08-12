"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadAssignmentHistoryController = exports.updateLeadAssignmentHistoryController = exports.getLeadAssignmentHistoryByIdController = exports.getLeadAssignmentHistoriesController = exports.createLeadAssignmentHistoryController = void 0;
const lead_assignment_history_service_1 = require("../../services/lead-assignment-history/lead-assignment-history.service");
/**
 * Create Lead Assignment History
 */
const createLeadAssignmentHistoryController = async (req, res) => {
    try {
        const result = await (0, lead_assignment_history_service_1.createLeadAssignmentHistory)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Lead Assignment History Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create lead assignment history",
        });
    }
};
exports.createLeadAssignmentHistoryController = createLeadAssignmentHistoryController;
/**
 * Get All Lead Assignment Histories
 */
const getLeadAssignmentHistoriesController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const leadId = req.query.leadId
            ? String(req.query.leadId)
            : undefined;
        const employeeId = req.query.employeeId
            ? String(req.query.employeeId)
            : undefined;
        const result = await (0, lead_assignment_history_service_1.getLeadAssignmentHistories)(page, limit, leadId, employeeId);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead Assignment Histories Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch lead assignment histories",
        });
    }
};
exports.getLeadAssignmentHistoriesController = getLeadAssignmentHistoriesController;
/**
 * Get Lead Assignment History By ID
 */
const getLeadAssignmentHistoryByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_assignment_history_service_1.getLeadAssignmentHistoryById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead Assignment History By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead Assignment History Not Found",
        });
    }
};
exports.getLeadAssignmentHistoryByIdController = getLeadAssignmentHistoryByIdController;
/**
 * Update Lead Assignment History
 */
const updateLeadAssignmentHistoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_assignment_history_service_1.updateLeadAssignmentHistory)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Lead Assignment History Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update lead assignment history",
        });
    }
};
exports.updateLeadAssignmentHistoryController = updateLeadAssignmentHistoryController;
/**
 * Delete Lead Assignment History
 */
const deleteLeadAssignmentHistoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_assignment_history_service_1.deleteLeadAssignmentHistory)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Lead Assignment History Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead Assignment History Not Found",
        });
    }
};
exports.deleteLeadAssignmentHistoryController = deleteLeadAssignmentHistoryController;
