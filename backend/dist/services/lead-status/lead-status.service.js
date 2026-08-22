"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadStatus = exports.updateLeadStatus = exports.getLeadStatusById = exports.getLeadStatuses = exports.createLeadStatus = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createLeadStatus = async (data) => {
    // Check duplicate Lead Status
    const existingLeadStatus = await prisma_1.default.leadStatus.findUnique({
        where: {
            name: data.name,
        },
    });
    if (existingLeadStatus) {
        throw new Error("Lead Status Already Exists");
    }
    // Create Lead Status
    const leadStatus = await prisma_1.default.leadStatus.create({
        data: {
            name: data.name,
            color: data.color,
            sortOrder: data.sortOrder ?? 0,
            isActive: data.isActive ?? true,
        },
    });
    return {
        success: true,
        message: "Lead Status Created Successfully",
        leadStatus,
    };
};
exports.createLeadStatus = createLeadStatus;
const getLeadStatuses = async (page, limit, search, isActive) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Search by status name
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
    const total = await prisma_1.default.leadStatus.count({
        where,
    });
    // Get Lead Statuses
    const leadStatuses = await prisma_1.default.leadStatus.findMany({
        where,
        orderBy: [
            {
                sortOrder: "asc",
            },
            {
                createdAt: "desc",
            },
        ],
        skip,
        take: limit,
    });
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        leadStatuses,
    };
};
exports.getLeadStatuses = getLeadStatuses;
const getLeadStatusById = async (id) => {
    const leadStatus = await prisma_1.default.leadStatus.findUnique({
        where: {
            id,
        },
    });
    if (!leadStatus) {
        throw new Error("Lead Status Not Found");
    }
    return {
        success: true,
        leadStatus,
    };
};
exports.getLeadStatusById = getLeadStatusById;
const updateLeadStatus = async (id, data) => {
    // Check Lead Status Exists
    const existingLeadStatus = await prisma_1.default.leadStatus.findUnique({
        where: {
            id,
        },
    });
    if (!existingLeadStatus) {
        throw new Error("Lead Status Not Found");
    }
    // Update Lead Status
    const leadStatus = await prisma_1.default.leadStatus.update({
        where: {
            id,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.color !== undefined && {
                color: data.color,
            }),
            ...(data.sortOrder !== undefined && {
                sortOrder: data.sortOrder,
            }),
            ...(data.isActive !== undefined && {
                isActive: data.isActive,
            }),
        },
    });
    return {
        success: true,
        message: "Lead Status Updated Successfully",
        leadStatus,
    };
};
exports.updateLeadStatus = updateLeadStatus;
const deleteLeadStatus = async (id) => {
    // Check Lead Status Exists
    const existingLeadStatus = await prisma_1.default.leadStatus.findUnique({
        where: {
            id,
        },
    });
    if (!existingLeadStatus) {
        throw new Error("Lead Status Not Found");
    }
    // Delete Lead Status
    const leadStatus = await prisma_1.default.leadStatus.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Lead Status Deleted Successfully",
        leadStatus,
    };
};
exports.deleteLeadStatus = deleteLeadStatus;
