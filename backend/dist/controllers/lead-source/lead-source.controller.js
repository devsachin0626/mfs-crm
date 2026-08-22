"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadSourceController = exports.updateLeadSourceController = exports.getLeadSourceByIdController = exports.getLeadSourcesController = exports.createLeadSourceController = void 0;
const lead_source_service_1 = require("../../services/lead-source/lead-source.service");
/**
 * Create Lead Source
 */
const createLeadSourceController = async (req, res) => {
    try {
        const result = await (0, lead_source_service_1.createLeadSource)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Lead Source Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create lead source",
        });
    }
};
exports.createLeadSourceController = createLeadSourceController;
/**
 * Get All Lead Sources
 */
const getLeadSourcesController = async (req, res) => {
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
        const result = await (0, lead_source_service_1.getLeadSources)(page, limit, search, isActive);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead Sources Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch lead sources",
        });
    }
};
exports.getLeadSourcesController = getLeadSourcesController;
/**
 * Get Lead Source By ID
 */
const getLeadSourceByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_source_service_1.getLeadSourceById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Lead Source By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead Source Not Found",
        });
    }
};
exports.getLeadSourceByIdController = getLeadSourceByIdController;
/**
 * Update Lead Source
 */
const updateLeadSourceController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_source_service_1.updateLeadSource)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Lead Source Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update lead source",
        });
    }
};
exports.updateLeadSourceController = updateLeadSourceController;
/**
 * Delete Lead Source
 */
const deleteLeadSourceController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, lead_source_service_1.deleteLeadSource)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Lead Source Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Lead Source Not Found",
        });
    }
};
exports.deleteLeadSourceController = deleteLeadSourceController;
