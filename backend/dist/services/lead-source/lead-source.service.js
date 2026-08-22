"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadSource = exports.updateLeadSource = exports.getLeadSourceById = exports.getLeadSources = exports.createLeadSource = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createLeadSource = async (data) => {
    const existingLeadSource = await prisma_1.default.leadSource.findUnique({
        where: {
            name: data.name,
        },
    });
    if (existingLeadSource) {
        throw new Error("Lead Source Already Exists");
    }
    const leadSource = await prisma_1.default.leadSource.create({
        data: {
            name: data.name,
            description: data.description,
            isActive: data.isActive ?? true,
        },
    });
    return {
        success: true,
        message: "Lead Source Created Successfully",
        leadSource,
    };
};
exports.createLeadSource = createLeadSource;
const getLeadSources = async (page, limit, search, isActive) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Search by name
    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive",
        };
    }
    // Active / Inactive filter
    if (isActive !== undefined) {
        where.isActive = isActive;
    }
    // Total count
    const total = await prisma_1.default.leadSource.count({
        where,
    });
    // Get Lead Sources
    const leadSources = await prisma_1.default.leadSource.findMany({
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
        leadSources,
    };
};
exports.getLeadSources = getLeadSources;
const getLeadSourceById = async (id) => {
    const leadSource = await prisma_1.default.leadSource.findUnique({
        where: {
            id,
        },
    });
    if (!leadSource) {
        throw new Error("Lead Source Not Found");
    }
    return {
        success: true,
        leadSource,
    };
};
exports.getLeadSourceById = getLeadSourceById;
const updateLeadSource = async (id, data) => {
    // Check Lead Source Exists
    const existingLeadSource = await prisma_1.default.leadSource.findUnique({
        where: {
            id,
        },
    });
    if (!existingLeadSource) {
        throw new Error("Lead Source Not Found");
    }
    // Update Lead Source
    const leadSource = await prisma_1.default.leadSource.update({
        where: {
            id,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.description !== undefined && {
                description: data.description,
            }),
            ...(data.isActive !== undefined && {
                isActive: data.isActive,
            }),
        },
    });
    return {
        success: true,
        message: "Lead Source Updated Successfully",
        leadSource,
    };
};
exports.updateLeadSource = updateLeadSource;
const deleteLeadSource = async (id) => {
    // Check Lead Source Exists
    const existingLeadSource = await prisma_1.default.leadSource.findUnique({
        where: {
            id,
        },
    });
    if (!existingLeadSource) {
        throw new Error("Lead Source Not Found");
    }
    // Delete Lead Source
    const leadSource = await prisma_1.default.leadSource.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Lead Source Deleted Successfully",
        leadSource,
    };
};
exports.deleteLeadSource = deleteLeadSource;
