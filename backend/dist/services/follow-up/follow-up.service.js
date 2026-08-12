"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFollowUp = exports.updateFollowUp = exports.getFollowUpById = exports.getFollowUps = exports.createFollowUp = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createFollowUp = async (data) => {
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
    // Validate Follow-Up Date
    const followUpDate = new Date(data.followUpDate);
    if (isNaN(followUpDate.getTime())) {
        throw new Error("Invalid Follow Up Date");
    }
    // Create Follow-Up
    const followUp = await prisma_1.default.followUp.create({
        data: {
            leadId: data.leadId,
            employeeId: data.employeeId,
            followUpDate,
            remarks: data.remarks,
            isCompleted: data.isCompleted ?? false,
        },
    });
    return {
        success: true,
        message: "Follow Up Created Successfully",
        followUp,
    };
};
exports.createFollowUp = createFollowUp;
const getFollowUps = async (page, limit, leadId, employeeId, isCompleted) => {
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
    // Filter by Completion Status
    if (isCompleted !== undefined) {
        where.isCompleted = isCompleted;
    }
    // Total count
    const total = await prisma_1.default.followUp.count({
        where,
    });
    // Get FollowUps
    const followUps = await prisma_1.default.followUp.findMany({
        where,
        orderBy: {
            followUpDate: "asc",
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
        followUps,
    };
};
exports.getFollowUps = getFollowUps;
const getFollowUpById = async (id) => {
    const followUp = await prisma_1.default.followUp.findUnique({
        where: {
            id,
        },
    });
    if (!followUp) {
        throw new Error("Follow Up Not Found");
    }
    return {
        success: true,
        followUp,
    };
};
exports.getFollowUpById = getFollowUpById;
const updateFollowUp = async (id, data) => {
    // Check FollowUp exists
    const existingFollowUp = await prisma_1.default.followUp.findUnique({
        where: {
            id,
        },
    });
    if (!existingFollowUp) {
        throw new Error("Follow Up Not Found");
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
    // Validate Follow-Up Date if provided
    let followUpDate;
    if (data.followUpDate !== undefined) {
        followUpDate = new Date(data.followUpDate);
        if (isNaN(followUpDate.getTime())) {
            throw new Error("Invalid Follow Up Date");
        }
    }
    // Update FollowUp
    const followUp = await prisma_1.default.followUp.update({
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
            ...(followUpDate !== undefined && {
                followUpDate,
            }),
            ...(data.remarks !== undefined && {
                remarks: data.remarks,
            }),
            ...(data.isCompleted !== undefined && {
                isCompleted: data.isCompleted,
            }),
        },
    });
    return {
        success: true,
        message: "Follow Up Updated Successfully",
        followUp,
    };
};
exports.updateFollowUp = updateFollowUp;
const deleteFollowUp = async (id) => {
    // Check FollowUp exists
    const existingFollowUp = await prisma_1.default.followUp.findUnique({
        where: {
            id,
        },
    });
    if (!existingFollowUp) {
        throw new Error("Follow Up Not Found");
    }
    // Delete FollowUp
    const followUp = await prisma_1.default.followUp.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Follow Up Deleted Successfully",
        followUp,
    };
};
exports.deleteFollowUp = deleteFollowUp;
