"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePayroll = exports.getPayrollById = exports.getPayrolls = exports.createPayroll = exports.previewPayroll = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const payroll_policy_service_1 = require("./payroll-policy.service");
/* ============================
   CURRENT EMPLOYEE
============================ */
/* ============================
   ROLE NAME
============================ */
const getRoleName = (currentEmployee) => {
    if (typeof currentEmployee.role ===
        "string") {
        return currentEmployee.role;
    }
    return (currentEmployee.role?.name ||
        "");
};
/* ============================
   PAYROLL ACCESS IDS

   ADMIN / HR
   -> ALL

   EMPLOYEE
   -> SELF

   TEAM LEADER
   -> SELF + TEAM
============================ */
const getPayrollEmployeeIds = async (currentEmployee) => {
    const roleName = getRoleName(currentEmployee);
    if (roleName ===
        "ADMIN" ||
        roleName ===
            "HR") {
        return null;
    }
    if (roleName ===
        "EMPLOYEE") {
        return [
            currentEmployee.id,
        ];
    }
    if (roleName ===
        "TEAM_LEADER") {
        const teamMembers = await prisma_1.default.employee.findMany({
            where: {
                reportingManagerId: currentEmployee.id,
                isActive: true,
            },
            select: {
                id: true,
            },
        });
        return [
            currentEmployee.id,
            ...teamMembers.map((item) => item.id),
        ];
    }
    return [];
};
/* ============================
   CHECK VIEW ACCESS
============================ */
const checkPayrollAccess = async (employeeId, currentEmployee) => {
    const allowedIds = await getPayrollEmployeeIds(currentEmployee);
    if (allowedIds === null) {
        return;
    }
    if (!allowedIds.includes(employeeId)) {
        throw new Error("Payroll Access Denied");
    }
};
/* ============================
   CHECK MANAGEMENT ACCESS
============================ */
const checkPayrollManageAccess = (currentEmployee) => {
    const roleName = getRoleName(currentEmployee);
    if (roleName !==
        "ADMIN" &&
        roleName !==
            "HR") {
        throw new Error("Payroll Management Access Denied");
    }
};
/* ============================
   PERIOD VALIDATION
============================ */
const validatePayrollPeriod = (month, year) => {
    if (!Number.isInteger(month) ||
        month < 1 ||
        month > 12) {
        throw new Error("Invalid Payroll Month");
    }
    if (!Number.isInteger(year) ||
        year < 2000 ||
        year > 2100) {
        throw new Error("Invalid Payroll Year");
    }
};
/* ============================
   PAYROLL PREVIEW
============================ */
const previewPayroll = async (employeeId, month, year, incentive = 0, bonus = 0, deduction = 0, currentEmployee) => {
    checkPayrollManageAccess(currentEmployee);
    validatePayrollPeriod(month, year);
    /* ============================
       DUPLICATE CHECK
    ============================ */
    const existingPayroll = await prisma_1.default.payroll.findUnique({
        where: {
            employeeId_month_year: {
                employeeId,
                month,
                year,
            },
        },
    });
    if (existingPayroll) {
        throw new Error("Payroll Already Exists For This Employee And Month");
    }
    /* ============================
       POLICY ENGINE
    ============================ */
    const policy = await (0, payroll_policy_service_1.calculatePayrollPolicy)({
        employeeId,
        month,
        year,
        incentive,
        bonus,
        deduction,
        currentEmployee,
    });
    return {
        success: true,
        employee: policy.employee,
        month: policy.month,
        year: policy.year,
        period: policy.period,
        attendance: policy.attendance,
        leaveBalance: policy.leaveBalance,
        salary: policy.salary,
    };
};
exports.previewPayroll = previewPayroll;
/* ============================
   CREATE PAYROLL
============================ */
const createPayroll = async (data, currentEmployee) => {
    checkPayrollManageAccess(currentEmployee);
    validatePayrollPeriod(data.month, data.year);
    /* ============================
       DUPLICATE CHECK
    ============================ */
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
    /* ============================
       IMPORTANT

       Salary / attendance values
       frontend se nahi lenge.

       Backend policy engine
       sab calculate karega.
    ============================ */
    const policy = await (0, payroll_policy_service_1.calculatePayrollPolicy)({
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        incentive: Number(data.incentive ||
            0),
        bonus: Number(data.bonus ||
            0),
        deduction: Number(data.deduction ||
            0),
        currentEmployee,
    });
    /* ============================
       TRANSACTION

       Payroll
       +
       Leave Balance
    ============================ */
    const result = await prisma_1.default.$transaction(async (tx) => {
        /* ============================
           SAVE LEAVE BALANCE
        ============================ */
        await tx.employeeLeaveBalance.upsert({
            where: {
                employeeId_month_year: {
                    employeeId: data.employeeId,
                    month: data.month,
                    year: data.year,
                },
            },
            create: {
                employeeId: data.employeeId,
                month: data.month,
                year: data.year,
                openingBalance: policy
                    .leaveBalance
                    .openingBalance,
                creditedLeave: policy
                    .leaveBalance
                    .creditedLeave,
                usedPaidLeave: policy
                    .leaveBalance
                    .usedPaidLeave,
                closingBalance: policy
                    .leaveBalance
                    .closingBalance,
            },
            update: {
                openingBalance: policy
                    .leaveBalance
                    .openingBalance,
                creditedLeave: policy
                    .leaveBalance
                    .creditedLeave,
                usedPaidLeave: policy
                    .leaveBalance
                    .usedPaidLeave,
                closingBalance: policy
                    .leaveBalance
                    .closingBalance,
            },
        });
        /* ============================
           CREATE PAYROLL
        ============================ */
        const payroll = await tx.payroll.create({
            data: {
                employeeId: data.employeeId,
                month: data.month,
                year: data.year,
                periodStart: policy
                    .period
                    .start,
                periodEnd: policy
                    .period
                    .end,
                basicSalary: policy
                    .salary
                    .basicSalary,
                /*
                 * Existing workingDays
                 * compatibility field.
                 */
                workingDays: policy
                    .attendance
                    .scheduledWorkingDays,
                scheduledWorkingDays: policy
                    .attendance
                    .scheduledWorkingDays,
                presentDays: policy
                    .attendance
                    .presentDays,
                lateDays: policy
                    .attendance
                    .lateDays,
                halfDays: policy
                    .attendance
                    .halfDays,
                leaveDays: policy
                    .attendance
                    .approvedLeaveDays,
                absentDays: policy
                    .attendance
                    .absentDays,
                paidLeaveDays: policy
                    .attendance
                    .paidLeaveDays,
                unpaidLeaveDays: policy
                    .attendance
                    .unpaidLeaveDays,
                actualLateCount: policy
                    .attendance
                    .actualLateCount,
                allowedLateCount: policy
                    .attendance
                    .allowedLateCount,
                excessLateCount: policy
                    .attendance
                    .excessLateCount,
                earlyGoingCount: policy
                    .attendance
                    .earlyGoingCount,
                allowedEarlyGoingCount: policy
                    .attendance
                    .allowedEarlyGoingCount,
                grossSalary: policy
                    .salary
                    .grossSalary,
                incentive: policy
                    .salary
                    .incentive,
                bonus: policy
                    .salary
                    .bonus,
                deduction: policy
                    .salary
                    .otherDeduction,
                lateDeduction: policy
                    .salary
                    .lateDeduction,
                netSalary: policy
                    .salary
                    .netSalary,
                /*
                 * New payroll always
                 * starts as PENDING.
                 */
                status: client_1.PayrollStatus.PENDING,
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
                        salary: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                        branch: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        return payroll;
    });
    return {
        success: true,
        message: "Payroll Created Successfully",
        payroll: result,
        leaveBalance: policy.leaveBalance,
    };
};
exports.createPayroll = createPayroll;
/* ============================
   GET PAYROLLS
============================ */
const getPayrolls = async (page, limit, search, month, year, status, employeeId, currentEmployee) => {
    const safePage = Math.max(Number(page) ||
        1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) ||
        10, 1), 100);
    const skip = (safePage - 1) *
        safeLimit;
    const where = {};
    /* ============================
       ROLE ACCESS
    ============================ */
    const allowedIds = await getPayrollEmployeeIds(currentEmployee);
    if (allowedIds !== null) {
        where.employeeId = {
            in: allowedIds,
        };
    }
    /* ============================
       EMPLOYEE FILTER
    ============================ */
    if (employeeId) {
        await checkPayrollAccess(employeeId, currentEmployee);
        where.employeeId =
            employeeId;
    }
    /* ============================
       SEARCH
    ============================ */
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
                {
                    mobile: {
                        contains: search,
                    },
                },
            ],
        };
    }
    /* ============================
       MONTH
    ============================ */
    if (month !==
        undefined) {
        if (month < 1 ||
            month > 12) {
            throw new Error("Invalid Payroll Month");
        }
        where.month =
            month;
    }
    /* ============================
       YEAR
    ============================ */
    if (year !==
        undefined) {
        where.year =
            year;
    }
    /* ============================
       STATUS
    ============================ */
    if (status) {
        if (!Object.values(client_1.PayrollStatus).includes(status)) {
            throw new Error("Invalid Payroll Status");
        }
        where.status =
            status;
    }
    const [payrolls, total,] = await Promise.all([
        prisma_1.default.payroll.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                        mobile: true,
                        email: true,
                        salary: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                        branch: {
                            select: {
                                name: true,
                            },
                        },
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
            take: safeLimit,
        }),
        prisma_1.default.payroll.count({
            where,
        }),
    ]);
    return {
        success: true,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total /
            safeLimit),
        payrolls,
    };
};
exports.getPayrolls = getPayrolls;
/* ============================
   GET PAYROLL BY ID
============================ */
const getPayrollById = async (id, currentEmployee) => {
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
                    salary: true,
                    role: {
                        select: {
                            name: true,
                        },
                    },
                    branch: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    if (!payroll) {
        throw new Error("Payroll Not Found");
    }
    await checkPayrollAccess(payroll.employeeId, currentEmployee);
    return {
        success: true,
        payroll,
    };
};
exports.getPayrollById = getPayrollById;
/* ============================
   UPDATE PAYROLL
============================ */
const updatePayroll = async (id, data, currentEmployee) => {
    checkPayrollManageAccess(currentEmployee);
    const existingPayroll = await prisma_1.default.payroll.findUnique({
        where: {
            id,
        },
    });
    if (!existingPayroll) {
        throw new Error("Payroll Not Found");
    }
    /* ============================
       PAID = FULL LOCK
    ============================ */
    if (existingPayroll.status ===
        client_1.PayrollStatus.PAID) {
        throw new Error("Paid Payroll Cannot Be Modified");
    }
    /* ============================
       STATUS TRANSITIONS
    ============================ */
    let newStatus = existingPayroll.status;
    if (data.status !==
        undefined) {
        const allowedTransitions = {
            PENDING: [
                client_1.PayrollStatus.GENERATED,
            ],
            GENERATED: [
                client_1.PayrollStatus.APPROVED,
            ],
            APPROVED: [
                client_1.PayrollStatus.PAID,
            ],
            PAID: [],
        };
        if (data.status !==
            existingPayroll.status &&
            !allowedTransitions[existingPayroll.status].includes(data.status)) {
            throw new Error(`Invalid Payroll Status Transition: ${existingPayroll.status} -> ${data.status}`);
        }
        newStatus =
            data.status;
    }
    /* ============================
       ONLY ADJUSTMENTS CAN CHANGE

       Attendance / Salary base /
       Period cannot be manually
       manipulated after generation.
    ============================ */
    const incentive = data.incentive !==
        undefined
        ? Math.max(Number(data.incentive), 0)
        : Number(existingPayroll.incentive);
    const bonus = data.bonus !==
        undefined
        ? Math.max(Number(data.bonus), 0)
        : Number(existingPayroll.bonus);
    const deduction = data.deduction !==
        undefined
        ? Math.max(Number(data.deduction), 0)
        : Number(existingPayroll.deduction);
    const grossSalary = Number(existingPayroll.grossSalary);
    const lateDeduction = Number(existingPayroll.lateDeduction);
    const netSalary = Number(Math.max(grossSalary +
        incentive +
        bonus -
        deduction -
        lateDeduction, 0).toFixed(2));
    const payroll = await prisma_1.default.payroll.update({
        where: {
            id,
        },
        data: {
            incentive,
            bonus,
            deduction,
            netSalary,
            status: newStatus,
            ...(data.remarks !==
                undefined && {
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
        message: newStatus !==
            existingPayroll.status
            ? `Payroll Status Updated To ${newStatus}`
            : "Payroll Updated Successfully",
        payroll,
    };
};
exports.updatePayroll = updatePayroll;
