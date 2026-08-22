"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveRejectLeave = exports.updateLeave = exports.getLeaveById = exports.getLeaves = exports.applyLeave = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const applyLeave = async (data) => {
    // Check Employee
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Validate Dates
    if (new Date(data.fromDate) > new Date(data.toDate)) {
        throw new Error("From Date cannot be greater than To Date");
    }
    // Check Leave Overlap
    const existingLeave = await prisma_1.default.leave.findFirst({
        where: {
            employeeId: data.employeeId,
            OR: [
                {
                    fromDate: {
                        lte: new Date(data.toDate),
                    },
                    toDate: {
                        gte: new Date(data.fromDate),
                    },
                },
            ],
        },
    });
    if (existingLeave) {
        throw new Error("Leave Already Applied For Selected Dates");
    }
    // Apply Leave
    const leave = await prisma_1.default.leave.create({
        data: {
            employeeId: data.employeeId,
            fromDate: new Date(data.fromDate),
            toDate: new Date(data.toDate),
            reason: data.reason,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
        },
    });
    return {
        success: true,
        message: "Leave Applied Successfully",
        leave,
    };
};
exports.applyLeave = applyLeave;
const getLeaves = async (page, limit, search, status, employeeId) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Search Employee Name
    if (search) {
        where.employee = {
            name: {
                contains: search,
                mode: "insensitive",
            },
        };
    }
    // Filter by Status
    if (status) {
        where.status = status;
    }
    if (employeeId) {
        where.employeeId = employeeId;
    }
    const total = await prisma_1.default.leave.count({
        where,
    });
    const leaves = await prisma_1.default.leave.findMany({
        where,
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
            approvedBy: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
        },
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
        leaves,
    };
};
exports.getLeaves = getLeaves;
const getLeaveById = async (id) => {
    const leave = await prisma_1.default.leave.findUnique({
        where: {
            id,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
            approvedBy: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
        },
    });
    if (!leave) {
        throw new Error("Leave Not Found");
    }
    return {
        success: true,
        leave,
    };
};
exports.getLeaveById = getLeaveById;
const updateLeave = async (id, data) => {
    // Check Leave Exists
    const leave = await prisma_1.default.leave.findUnique({
        where: {
            id,
        },
    });
    if (!leave) {
        throw new Error("Leave Not Found");
    }
    // Validate Dates
    const fromDate = data.fromDate
        ? new Date(data.fromDate)
        : leave.fromDate;
    const toDate = data.toDate
        ? new Date(data.toDate)
        : leave.toDate;
    if (fromDate > toDate) {
        throw new Error("From Date cannot be greater than To Date");
    }
    // Update Leave
    const updatedLeave = await prisma_1.default.leave.update({
        where: {
            id,
        },
        data: {
            fromDate,
            toDate,
            reason: data.reason ?? leave.reason,
            status: data.status ?? leave.status,
            approvedById: data.approvedById !== undefined
                ? data.approvedById
                : leave.approvedById,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
            approvedBy: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
        },
    });
    return {
        success: true,
        message: "Leave Updated Successfully",
        leave: updatedLeave,
    };
};
exports.updateLeave = updateLeave;
const approveRejectLeave = async (id, status, approvedById) => {
    // Check Leave Exists
    const leave = await prisma_1.default.leave.findUnique({
        where: {
            id,
        },
    });
    if (!leave) {
        throw new Error("Leave Not Found");
    }
    // Check Approver Exists
    const approver = await prisma_1.default.employee.findUnique({
        where: {
            id: approvedById,
        },
    });
    if (!approver) {
        throw new Error("Approver Not Found");
    }
    // Prevent Multiple Approval/Rejection
    if (leave.status !== "PENDING") {
        throw new Error("Leave has already been processed");
    }
    // Approve / Reject Leave
    const updatedLeave = await prisma_1.default.leave.update({
        where: {
            id,
        },
        data: {
            status,
            approvedById,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
            approvedBy: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
        },
    });
    return {
        success: true,
        message: `Leave ${status.toLowerCase()} successfully`,
        leave: updatedLeave,
    };
};
exports.approveRejectLeave = approveRejectLeave;
