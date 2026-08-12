"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImportBatchController = exports.updateImportBatchController = exports.getImportBatchByIdController = exports.getImportBatchesController = exports.createImportBatchController = void 0;
const import_batch_service_1 = require("../../services/import-batch/import-batch.service");
/**
 * Create Import Batch
 */
const createImportBatchController = async (req, res) => {
    try {
        const result = await (0, import_batch_service_1.createImportBatch)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Import Batch Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create import batch",
        });
    }
};
exports.createImportBatchController = createImportBatchController;
/**
 * Get All Import Batches
 */
const getImportBatchesController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search
            ? String(req.query.search)
            : undefined;
        const result = await (0, import_batch_service_1.getImportBatches)(page, limit, search);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Import Batches Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch import batches",
        });
    }
};
exports.getImportBatchesController = getImportBatchesController;
/**
 * Get Import Batch By ID
 */
const getImportBatchByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, import_batch_service_1.getImportBatchById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Import Batch By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Import Batch Not Found",
        });
    }
};
exports.getImportBatchByIdController = getImportBatchByIdController;
/**
 * Update Import Batch
 */
const updateImportBatchController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, import_batch_service_1.updateImportBatch)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Import Batch Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update import batch",
        });
    }
};
exports.updateImportBatchController = updateImportBatchController;
/**
 * Delete Import Batch
 */
const deleteImportBatchController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, import_batch_service_1.deleteImportBatch)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Import Batch Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Import Batch Not Found",
        });
    }
};
exports.deleteImportBatchController = deleteImportBatchController;
