"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadHistory = exports.updateLeadHistory = exports.getLeadHistoryById = exports.getLeadHistories = exports.createLeadHistory = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createLeadHistory = async (data) => {
    // Check Lead exists
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: data.leadId,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    // Check Employee if provided
    if (data.employeeId !== undefined) {
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: data.employeeId,
            },
        });
        if (!employee) {
            throw new Error("Employee Not Found");
        }
    }
    // Check Lead Status if provided
    if (data.statusId !== undefined) {
        const status = await prisma_1.default.leadStatus.findUnique({
            where: {
                id: data.statusId,
            },
        });
        if (!status) {
            throw new Error("Lead Status Not Found");
        }
    }
    // Create Lead History
    const leadHistory = await prisma_1.default.leadHistory.create({
        data: {
            leadId: data.leadId,
            employeeId: data.employeeId,
            statusId: data.statusId,
            remarks: data.remarks,
        },
    });
    return {
        success: true,
        message: "Lead History Created Successfully",
        leadHistory,
    };
};
exports.createLeadHistory = createLeadHistory;
const getLeadHistories = async (page, limit, leadId, employeeId, statusId) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Filter by Lead
    if (leadId) {
        where.leadId = leadId;
    }
    // Filter by Employee
    if (employeeId) {
        where.employeeId = employeeId;
    }
    // Filter by Lead Status
    if (statusId) {
        where.statusId = statusId;
    }
    // Total count
    const total = await prisma_1.default.leadHistory.count({
        where,
    });
    // Get Lead Histories
    const leadHistories = await prisma_1.default.leadHistory.findMany({
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
        leadHistories,
    };
};
exports.getLeadHistories = getLeadHistories;
const getLeadHistoryById = async (id) => {
    const leadHistory = await prisma_1.default.leadHistory.findUnique({
        where: {
            id,
        },
    });
    if (!leadHistory) {
        throw new Error("Lead History Not Found");
    }
    return {
        success: true,
        leadHistory,
    };
};
exports.getLeadHistoryById = getLeadHistoryById;
const updateLeadHistory = async (id, data) => {
    // Check Lead History exists
    const existingHistory = await prisma_1.default.leadHistory.findUnique({
        where: {
            id,
        },
    });
    if (!existingHistory) {
        throw new Error("Lead History Not Found");
    }
    // Check Lead if leadId is being updated
    if (data.leadId !== undefined) {
        const lead = await prisma_1.default.lead.findUnique({
            where: {
                id: data.leadId,
            },
        });
        if (!lead) {
            throw new Error("Lead Not Found");
        }
    }
    // Check Employee if employeeId is being updated
    if (data.employeeId !== undefined) {
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: data.employeeId,
            },
        });
        if (!employee) {
            throw new Error("Employee Not Found");
        }
    }
    // Check Lead Status if statusId is being updated
    if (data.statusId !== undefined) {
        const status = await prisma_1.default.leadStatus.findUnique({
            where: {
                id: data.statusId,
            },
        });
        if (!status) {
            throw new Error("Lead Status Not Found");
        }
    }
    // Update Lead History
    const leadHistory = await prisma_1.default.leadHistory.update({
        where: {
            id,
        },
        data: {
            ...(data.leadId !== undefined && {
                leadId: data.leadId,
            }),
            ...(data.employeeId !== undefined && {
                employeeId: data.employeeId,
            }),
            ...(data.statusId !== undefined && {
                statusId: data.statusId,
            }),
            ...(data.remarks !== undefined && {
                remarks: data.remarks,
            }),
        },
    });
    return {
        success: true,
        message: "Lead History Updated Successfully",
        leadHistory,
    };
};
exports.updateLeadHistory = updateLeadHistory;
const deleteLeadHistory = async (id) => {
    // Check Lead History exists
    const existingHistory = await prisma_1.default.leadHistory.findUnique({
        where: {
            id,
        },
    });
    if (!existingHistory) {
        throw new Error("Lead History Not Found");
    }
    // Delete Lead History
    const leadHistory = await prisma_1.default.leadHistory.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Lead History Deleted Successfully",
        leadHistory,
    };
};
exports.deleteLeadHistory = deleteLeadHistory;
