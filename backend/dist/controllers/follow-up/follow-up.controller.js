"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFollowUpController = exports.updateFollowUpController = exports.getFollowUpByIdController = exports.getFollowUpsController = exports.createFollowUpController = void 0;
const follow_up_service_1 = require("../../services/follow-up/follow-up.service");
/**
 * Create Follow Up
 */
const createFollowUpController = async (req, res) => {
    try {
        const result = await (0, follow_up_service_1.createFollowUp)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Follow Up Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create follow up",
        });
    }
};
exports.createFollowUpController = createFollowUpController;
/**
 * Get All Follow Ups
 */
const getFollowUpsController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const leadId = req.query.leadId
            ? String(req.query.leadId)
            : undefined;
        const employeeId = req.query.employeeId
            ? String(req.query.employeeId)
            : undefined;
        let isCompleted;
        if (req.query.isCompleted !== undefined) {
            isCompleted = String(req.query.isCompleted) === "true";
        }
        const result = await (0, follow_up_service_1.getFollowUps)(page, limit, leadId, employeeId, isCompleted);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Follow Ups Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch follow ups",
        });
    }
};
exports.getFollowUpsController = getFollowUpsController;
/**
 * Get Follow Up By ID
 */
const getFollowUpByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, follow_up_service_1.getFollowUpById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Follow Up By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Follow Up Not Found",
        });
    }
};
exports.getFollowUpByIdController = getFollowUpByIdController;
/**
 * Update Follow Up
 */
const updateFollowUpController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, follow_up_service_1.updateFollowUp)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Follow Up Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update follow up",
        });
    }
};
exports.updateFollowUpController = updateFollowUpController;
/**
 * Delete Follow Up
 */
const deleteFollowUpController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, follow_up_service_1.deleteFollowUp)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Follow Up Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Follow Up Not Found",
        });
    }
};
exports.deleteFollowUpController = deleteFollowUpController;
