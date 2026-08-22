"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImportBatch = exports.updateImportBatch = exports.getImportBatchById = exports.getImportBatches = exports.createImportBatch = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createImportBatch = async (data) => {
    // Check Employee exists
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.importedById,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Create Import Batch
    const importBatch = await prisma_1.default.importBatch.create({
        data: {
            fileName: data.fileName,
            totalRecords: data.totalRecords,
            imported: data.imported ?? 0,
            duplicates: data.duplicates ?? 0,
            failed: data.failed ?? 0,
            importedById: data.importedById,
        },
    });
    return {
        success: true,
        message: "Import Batch Created Successfully",
        importBatch,
    };
};
exports.createImportBatch = createImportBatch;
const getImportBatches = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Search by file name
    if (search) {
        where.fileName = {
            contains: search,
            mode: "insensitive",
        };
    }
    // Total count
    const total = await prisma_1.default.importBatch.count({
        where,
    });
    // Get Import Batches
    const importBatches = await prisma_1.default.importBatch.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        importBatches,
    };
};
exports.getImportBatches = getImportBatches;
const getImportBatchById = async (id) => {
    const importBatch = await prisma_1.default.importBatch.findUnique({
        where: {
            id,
        },
    });
    if (!importBatch) {
        throw new Error("Import Batch Not Found");
    }
    return {
        success: true,
        importBatch,
    };
};
exports.getImportBatchById = getImportBatchById;
const updateImportBatch = async (id, data) => {
    // Check Import Batch Exists
    const existingImportBatch = await prisma_1.default.importBatch.findUnique({
        where: {
            id,
        },
    });
    if (!existingImportBatch) {
        throw new Error("Import Batch Not Found");
    }
    // If importedById is being updated,
    // verify that Employee exists
    if (data.importedById !== undefined) {
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: data.importedById,
            },
        });
        if (!employee) {
            throw new Error("Employee Not Found");
        }
    }
    // Update Import Batch
    const importBatch = await prisma_1.default.importBatch.update({
        where: {
            id,
        },
        data: {
            ...(data.fileName !== undefined && {
                fileName: data.fileName,
            }),
            ...(data.totalRecords !== undefined && {
                totalRecords: data.totalRecords,
            }),
            ...(data.imported !== undefined && {
                imported: data.imported,
            }),
            ...(data.duplicates !== undefined && {
                duplicates: data.duplicates,
            }),
            ...(data.failed !== undefined && {
                failed: data.failed,
            }),
            ...(data.importedById !== undefined && {
                importedById: data.importedById,
            }),
        },
    });
    return {
        success: true,
        message: "Import Batch Updated Successfully",
        importBatch,
    };
};
exports.updateImportBatch = updateImportBatch;
const deleteImportBatch = async (id) => {
    // Check Import Batch Exists
    const existingImportBatch = await prisma_1.default.importBatch.findUnique({
        where: {
            id,
        },
    });
    if (!existingImportBatch) {
        throw new Error("Import Batch Not Found");
    }
    // Delete Import Batch
    const importBatch = await prisma_1.default.importBatch.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Import Batch Deleted Successfully",
        importBatch,
    };
};
exports.deleteImportBatch = deleteImportBatch;
