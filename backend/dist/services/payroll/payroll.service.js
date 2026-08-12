"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePayroll = exports.getPayrollById = exports.getPayrolls = exports.createPayroll = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const createPayroll = async (data) => {
    // Check Employee Exists
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Check Payroll Already Exists
    const existingPayroll = await prisma_1.default.payroll.findUnique({
        where: {
            employeeId_month_year: {
                employeeId: data.employeeId,
                month: data.month,
                year: data.year,
            },
        },
    });
    if (existingPayroll) {
        throw new Error("Payroll Already Exists For This Employee And Month");
    }
    // Create Payroll
    const payroll = await prisma_1.default.payroll.create({
        data: {
            employeeId: data.employeeId,
            month: data.month,
            year: data.year,
            basicSalary: data.basicSalary,
            workingDays: data.workingDays,
            presentDays: data.presentDays,
            lateDays: data.lateDays,
            halfDays: data.halfDays,
            leaveDays: data.leaveDays,
            absentDays: data.absentDays,
            grossSalary: data.grossSalary,
            incentive: data.incentive,
            bonus: data.bonus,
            deduction: data.deduction,
            netSalary: data.netSalary,
            status: data.status ?? client_1.PayrollStatus.PENDING,
            remarks: data.remarks,
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
        message: "Payroll Created Successfully",
        payroll,
    };
};
exports.createPayroll = createPayroll;
const getPayrolls = async (page, limit, search, month, year, status) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Search by Employee Name / Employee Code
    if (search) {
        where.employee = {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    employeeCode: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ],
        };
    }
    // Filter by Month & Year
    if (month && year) {
        where.month = month;
        where.year = year;
    }
    else if (month) {
        where.month = month;
    }
    else if (year) {
        where.year = year;
    }
    // Filter by Payroll Status
    if (status) {
        where.status = status;
    }
    // Total Count
    const total = await prisma_1.default.payroll.count({
        where,
    });
    // Get Payrolls
    const payrolls = await prisma_1.default.payroll.findMany({
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
        payrolls,
    };
};
exports.getPayrolls = getPayrolls;
const getPayrollById = async (id) => {
    const payroll = await prisma_1.default.payroll.findUnique({
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
    if (!payroll) {
        throw new Error("Payroll Not Found");
    }
    return {
        success: true,
        payroll,
    };
};
exports.getPayrollById = getPayrollById;
const updatePayroll = async (id, data) => {
    // Check Payroll Exists
    const existingPayroll = await prisma_1.default.payroll.findUnique({
        where: {
            id,
        },
    });
    if (!existingPayroll) {
        throw new Error("Payroll Not Found");
    }
    // Update Payroll
    const payroll = await prisma_1.default.payroll.update({
        where: {
            id,
        },
        data: {
            ...(data.month !== undefined && {
                month: data.month,
            }),
            ...(data.year !== undefined && {
                year: data.year,
            }),
            ...(data.basicSalary !== undefined && {
                basicSalary: data.basicSalary,
            }),
            ...(data.workingDays !== undefined && {
                workingDays: data.workingDays,
            }),
            ...(data.presentDays !== undefined && {
                presentDays: data.presentDays,
            }),
            ...(data.lateDays !== undefined && {
                lateDays: data.lateDays,
            }),
            ...(data.halfDays !== undefined && {
                halfDays: data.halfDays,
            }),
            ...(data.leaveDays !== undefined && {
                leaveDays: data.leaveDays,
            }),
            ...(data.absentDays !== undefined && {
                absentDays: data.absentDays,
            }),
            ...(data.grossSalary !== undefined && {
                grossSalary: data.grossSalary,
            }),
            ...(data.incentive !== undefined && {
                incentive: data.incentive,
            }),
            ...(data.bonus !== undefined && {
                bonus: data.bonus,
            }),
            ...(data.deduction !== undefined && {
                deduction: data.deduction,
            }),
            ...(data.netSalary !== undefined && {
                netSalary: data.netSalary,
            }),
            ...(data.status !== undefined && {
                status: data.status,
            }),
            ...(data.remarks !== undefined && {
                remarks: data.remarks,
            }),
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
        message: "Payroll Updated Successfully",
        payroll,
    };
};
exports.updatePayroll = updatePayroll;
