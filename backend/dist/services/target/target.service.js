"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTarget = exports.getTargetById = exports.getTargets = exports.createTarget = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const target_cycle_1 = require("../../utils/target-cycle");
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
   MANAGE ACCESS
============================ */
const checkTargetManageAccess = (currentEmployee) => {
    const roleName = getRoleName(currentEmployee);
    if (roleName !== "ADMIN" &&
        roleName !== "HR") {
        throw new Error("Target Management Access Denied");
    }
};
/* ============================
   GET ALLOWED EMPLOYEE IDS

   ADMIN / HR
   -> ALL

   TEAM LEADER
   -> SELF + TEAM

   EMPLOYEE
   -> SELF
============================ */
const getAllowedEmployeeIds = async (currentEmployee) => {
    const roleName = getRoleName(currentEmployee);
    if (roleName === "ADMIN" ||
        roleName === "HR") {
        return null;
    }
    if (roleName === "EMPLOYEE") {
        return [
            currentEmployee.id,
        ];
    }
    if (roleName === "TEAM_LEADER") {
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
   TARGET ACCESS CHECK
============================ */
const checkTargetAccess = async (employeeId, currentEmployee) => {
    const allowedIds = await getAllowedEmployeeIds(currentEmployee);
    if (allowedIds === null) {
        return;
    }
    if (!allowedIds.includes(employeeId)) {
        throw new Error("Target Access Denied");
    }
};
/* ============================
   MONTH / YEAR VALIDATION
============================ */
const validateTargetPeriod = (month, year) => {
    if (!Number.isInteger(month) ||
        month < 1 ||
        month > 12) {
        throw new Error("Invalid Target Month");
    }
    if (!Number.isInteger(year) ||
        year < 2000 ||
        year > 2100) {
        throw new Error("Invalid Target Year");
    }
};
/* ============================
   SAFE NUMBER
============================ */
const safeNumber = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return 0;
    }
    return Math.max(number, 0);
};
/* ============================
   CREATE TARGET
============================ */
const createTarget = async (data, currentEmployee) => {
    checkTargetManageAccess(currentEmployee);
    validateTargetPeriod(data.month, data.year);
    const { periodStart, periodEnd, } = (0, target_cycle_1.getTargetCycle)(data.month, data.year);
    /* ============================
       CHECK EMPLOYEE
    ============================ */
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
        select: {
            id: true,
            employeeCode: true,
            name: true,
            mobile: true,
            email: true,
            isActive: true,
            status: true,
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
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    if (!employee.isActive ||
        employee.status !==
            "ACTIVE") {
        throw new Error("Employee Account Inactive");
    }
    /* ============================
       DUPLICATE CHECK
    ============================ */
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
        throw new Error("Target Already Exists For This Employee And Month");
    }
    /* ============================
       CREATE
    ============================ */
    const target = await prisma_1.default.employeeTarget.create({
        data: {
            employeeId: data.employeeId,
            month: data.month,
            year: data.year,
            brokerageTarget: safeNumber(data.brokerageTarget),
            dematTarget: Math.floor(safeNumber(data.dematTarget)),
            revenueTarget: safeNumber(data.revenueTarget),
            achievedAmount: 0,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
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
    return {
        success: true,
        message: "Employee Target Created Successfully",
        target: {
            ...target,
            periodStart,
            periodEnd,
        },
    };
};
exports.createTarget = createTarget;
/* ============================
   GET TARGETS
============================ */
const getTargets = async (page, limit, search, month, year, employeeId, currentEmployee) => {
    if (!currentEmployee) {
        throw new Error("Authenticated Employee Not Found");
    }
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (safePage - 1) *
        safeLimit;
    const where = {};
    /* ============================
       ROLE FILTER
    ============================ */
    const allowedIds = await getAllowedEmployeeIds(currentEmployee);
    if (allowedIds !== null) {
        where.employeeId = {
            in: allowedIds,
        };
    }
    /* ============================
       EMPLOYEE FILTER
    ============================ */
    if (employeeId) {
        await checkTargetAccess(employeeId, currentEmployee);
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
            throw new Error("Invalid Target Month");
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
       DATA
    ============================ */
    const [targets, total,] = await Promise.all([
        prisma_1.default.employeeTarget.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                        mobile: true,
                        email: true,
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
        prisma_1.default.employeeTarget.count({
            where,
        }),
    ]);
    /* ============================
       PROGRESS
    ============================ */
    const targetsWithProgress = targets.map((target) => {
        const brokerageTarget = Number(target.brokerageTarget);
        const achievedAmount = Number(target.achievedAmount);
        const progressPercent = brokerageTarget > 0
            ? Number((achievedAmount /
                brokerageTarget *
                100).toFixed(2))
            : 0;
        const { periodStart, periodEnd, } = (0, target_cycle_1.getTargetCycle)(target.month, target.year);
        return {
            ...target,
            progressPercent,
            periodStart,
            periodEnd,
        };
    });
    return {
        success: true,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total /
            safeLimit),
        targets: targetsWithProgress,
    };
};
exports.getTargets = getTargets;
/* ============================
   GET TARGET BY ID
============================ */
const getTargetById = async (id, currentEmployee) => {
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
    if (!target) {
        throw new Error("Employee Target Not Found");
    }
    await checkTargetAccess(target.employeeId, currentEmployee);
    const { periodStart, periodEnd, } = (0, target_cycle_1.getTargetCycle)(target.month, target.year);
    const brokerageTarget = Number(target.brokerageTarget);
    const achievedAmount = Number(target.achievedAmount);
    const progressPercent = brokerageTarget > 0
        ? Number((achievedAmount /
            brokerageTarget *
            100).toFixed(2))
        : 0;
    return {
        success: true,
        target: {
            ...target,
            progressPercent,
            periodStart,
            periodEnd,
        },
    };
};
exports.getTargetById = getTargetById;
/* ============================
   UPDATE TARGET
============================ */
const updateTarget = async (id, data, currentEmployee) => {
    checkTargetManageAccess(currentEmployee);
    const target = await prisma_1.default.employeeTarget.findUnique({
        where: {
            id,
        },
    });
    if (!target) {
        throw new Error("Employee Target Not Found");
    }
    /* ============================
       UPDATE
    ============================ */
    const updatedTarget = await prisma_1.default.employeeTarget.update({
        where: {
            id,
        },
        data: {
            ...(data.brokerageTarget !==
                undefined && {
                brokerageTarget: safeNumber(data.brokerageTarget),
            }),
            ...(data.dematTarget !==
                undefined && {
                dematTarget: Math.floor(safeNumber(data.dematTarget)),
            }),
            ...(data.revenueTarget !==
                undefined && {
                revenueTarget: safeNumber(data.revenueTarget),
            }),
            /*
             * Abhi compatibility ke liye
             * achievedAmount manual edit
             * allow kar rahe hain.
             *
             * Baad me isko actual revenue/
             * brokerage data se auto-sync
             * karenge.
             */
            ...(data.achievedAmount !==
                undefined && {
                achievedAmount: safeNumber(data.achievedAmount),
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
    const brokerageTarget = Number(updatedTarget.brokerageTarget);
    const achievedAmount = Number(updatedTarget.achievedAmount);
    const progressPercent = brokerageTarget > 0
        ? Number((achievedAmount /
            brokerageTarget *
            100).toFixed(2))
        : 0;
    return {
        success: true,
        message: "Employee Target Updated Successfully",
        target: {
            ...updatedTarget,
            progressPercent,
        },
    };
};
exports.updateTarget = updateTarget;
