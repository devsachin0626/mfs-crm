"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadStatusController = exports.updateLeadStatusController = exports.getLeadStatusByIdController = exports.getLeadStatusesController = exports.createLeadStatusController = void 0;
const lead_status_service_1 = require("../../services/lead-status/lead-status.service");
/**
 * Create Lead Status
 */
const createLeadStatusController = async (req, res) => {
    try {
        const result = await (0, lead_status_service_1.createLeadStatus)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Lead Status Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create lead status",
        });
    }
};
exports.createLeadStatusController = createLeadStatusController;
/**
 * Get All Lead Statuses
 */
const getLeadStatusesController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search
            ? String(req.query.search)
            : undefined;
        let isActive;
        if (req.query.isActive !== undefined) {
            isActive = String(req.query.isActive) === "true";
        }
        const result = await (0, lead_status_service_1.getLeadStatuses)(page, limit, search, isActive);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead Statuses Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch lead statuses",
        });
    }
};
exports.getLeadStatusesController = getLeadStatusesController;
/**
 * Get Lead Status By ID
 */
const getLeadStatusByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_status_service_1.getLeadStatusById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead Status By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead Status Not Found",
        });
    }
};
exports.getLeadStatusByIdController = getLeadStatusByIdController;
/**
 * Update Lead Status
 */
const updateLeadStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_status_service_1.updateLeadStatus)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Lead Status Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update lead status",
        });
    }
};
exports.updateLeadStatusController = updateLeadStatusController;
/**
 * Delete Lead Status
 */
const deleteLeadStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_status_service_1.deleteLeadStatus)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Lead Status Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead Status Not Found",
        });
    }
};
exports.deleteLeadStatusController = deleteLeadStatusController;
