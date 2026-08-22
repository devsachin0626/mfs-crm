"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTarget = exports.getTargetById = exports.getTargets = exports.createTarget = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createTarget = async (data) => {
    // Check Employee
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Check Duplicate Target
    const existingTarget = await prisma_1.default.employeeTarget.findUnique({
        where: {
            employeeId_month_year: {
                employeeId: data.employeeId,
                month: data.month,
                year: data.year,
            },
        },
    });
    if (existingTarget) {
        throw new Error("Target Already Exists For This Month");
    }
    // Create Target
    const target = await prisma_1.default.employeeTarget.create({
        data: {
            employeeId: data.employeeId,
            month: data.month,
            year: data.year,
            brokerageTarget: data.brokerageTarget,
            dematTarget: data.dematTarget,
            revenueTarget: data.revenueTarget,
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
        message: "Employee Target Created Successfully",
        target,
    };
};
exports.createTarget = createTarget;
const getTargets = async (page, limit, search, month, year, employeeId) => {
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
    if (employeeId) {
        where.employeeId = employeeId;
    }
    // Filter Month
    if (month) {
        where.month = month;
    }
    // Filter Year
    if (year) {
        where.year = year;
    }
    const total = await prisma_1.default.employeeTarget.count({
        where,
    });
    const targets = await prisma_1.default.employeeTarget.findMany({
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
        },
        orderBy: [
            {
                year: "desc",
            },
            {
                month: "desc",
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
        targets,
    };
};
exports.getTargets = getTargets;
const getTargetById = async (id) => {
    const target = await prisma_1.default.employeeTarget.findUnique({
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
        },
    });
    if (!target) {
        throw new Error("Employee Target Not Found");
    }
    return {
        success: true,
        target,
    };
};
exports.getTargetById = getTargetById;
const updateTarget = async (id, data) => {
    // Check Target Exists
    const target = await prisma_1.default.employeeTarget.findUnique({
        where: {
            id,
        },
    });
    if (!target) {
        throw new Error("Employee Target Not Found");
    }
    // Update Target
    const updatedTarget = await prisma_1.default.employeeTarget.update({
        where: {
            id,
        },
        data: {
            brokerageTarget: data.brokerageTarget ?? target.brokerageTarget,
            dematTarget: data.dematTarget ?? target.dematTarget,
            revenueTarget: data.revenueTarget ?? target.revenueTarget,
            achievedAmount: data.achievedAmount ?? target.achievedAmount,
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
        message: "Employee Target Updated Successfully",
        target: updatedTarget,
    };
};
exports.updateTarget = updateTarget;
