"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeadAssignmentHistory = exports.updateLeadAssignmentHistory = exports.getLeadAssignmentHistoryById = exports.getLeadAssignmentHistories = exports.createLeadAssignmentHistory = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createLeadAssignmentHistory = async (data) => {
    // Check Lead exists
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: data.leadId,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    // Check destination Employee exists
    const toEmployee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.toEmployeeId,
        },
    });
    if (!toEmployee) {
        throw new Error("To Employee Not Found");
    }
    // Check source Employee if provided
    if (data.fromEmployeeId) {
        const fromEmployee = await prisma_1.default.employee.findUnique({
            where: {
                id: data.fromEmployeeId,
            },
        });
        if (!fromEmployee) {
            throw new Error("From Employee Not Found");
        }
    }
    // Create Assignment History
    const assignmentHistory = await prisma_1.default.leadAssignmentHistory.create({
        data: {
            leadId: data.leadId,
            fromEmployeeId: data.fromEmployeeId,
            toEmployeeId: data.toEmployeeId,
            reason: data.reason,
        },
    });
    return {
        success: true,
        message: "Lead Assignment History Created Successfully",
        assignmentHistory,
    };
};
exports.createLeadAssignmentHistory = createLeadAssignmentHistory;
const getLeadAssignmentHistories = async (page, limit, leadId, employeeId) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Filter by Lead
    if (leadId) {
        where.leadId = leadId;
    }
    // Filter by Employee
    if (employeeId) {
        where.OR = [
            {
                fromEmployeeId: employeeId,
            },
            {
                toEmployeeId: employeeId,
            },
        ];
    }
    // Total count
    const total = await prisma_1.default.leadAssignmentHistory.count({
        where,
    });
    // Get Assignment Histories
    const assignmentHistories = await prisma_1.default.leadAssignmentHistory.findMany({
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
        assignmentHistories,
    };
};
exports.getLeadAssignmentHistories = getLeadAssignmentHistories;
const getLeadAssignmentHistoryById = async (id) => {
    const assignmentHistory = await prisma_1.default.leadAssignmentHistory.findUnique({
        where: {
            id,
        },
    });
    if (!assignmentHistory) {
        throw new Error("Lead Assignment History Not Found");
    }
    return {
        success: true,
        assignmentHistory,
    };
};
exports.getLeadAssignmentHistoryById = getLeadAssignmentHistoryById;
const updateLeadAssignmentHistory = async (id, data) => {
    // Check history exists
    const existingHistory = await prisma_1.default.leadAssignmentHistory.findUnique({
        where: {
            id,
        },
    });
    if (!existingHistory) {
        throw new Error("Lead Assignment History Not Found");
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
    // Check destination Employee
    if (data.toEmployeeId !== undefined) {
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: data.toEmployeeId,
            },
        });
        if (!employee) {
            throw new Error("To Employee Not Found");
        }
    }
    // Check source Employee if provided
    if (data.fromEmployeeId !== undefined) {
        if (data.fromEmployeeId === null) {
            // Allow removing source employee
        }
        else {
            const employee = await prisma_1.default.employee.findUnique({
                where: {
                    id: data.fromEmployeeId,
                },
            });
            if (!employee) {
                throw new Error("From Employee Not Found");
            }
        }
    }
    // Update Assignment History
    const assignmentHistory = await prisma_1.default.leadAssignmentHistory.update({
        where: {
            id,
        },
        data: {
            ...(data.leadId !== undefined && {
                leadId: data.leadId,
            }),
            ...(data.fromEmployeeId !== undefined && {
                fromEmployeeId: data.fromEmployeeId,
            }),
            ...(data.toEmployeeId !== undefined && {
                toEmployeeId: data.toEmployeeId,
            }),
            ...(data.reason !== undefined && {
                reason: data.reason,
            }),
        },
    });
    return {
        success: true,
        message: "Lead Assignment History Updated Successfully",
        assignmentHistory,
    };
};
exports.updateLeadAssignmentHistory = updateLeadAssignmentHistory;
const deleteLeadAssignmentHistory = async (id) => {
    // Check history exists
    const existingHistory = await prisma_1.default.leadAssignmentHistory.findUnique({
        where: {
            id,
        },
    });
    if (!existingHistory) {
        throw new Error("Lead Assignment History Not Found");
    }
    // Delete Assignment History
    const assignmentHistory = await prisma_1.default.leadAssignmentHistory.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Lead Assignment History Deleted Successfully",
        assignmentHistory,
    };
};
exports.deleteLeadAssignmentHistory = deleteLeadAssignmentHistory;
