"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveRejectLeave = exports.updateLeave = exports.getLeaveById = exports.getLeaves = exports.applyLeave = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
/* ============================
   DATE HELPERS
============================ */
const startOfDay = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid Date");
    }
    date.setHours(0, 0, 0, 0);
    return date;
};
const endOfDay = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid Date");
    }
    date.setHours(23, 59, 59, 999);
    return date;
};
/* ============================
   LEAVE ACCESS IDS

   ADMIN / HR
   → ALL

   EMPLOYEE
   → SELF

   TEAM LEADER
   → SELF + TEAM
============================ */
const getLeaveEmployeeIds = async (currentEmployee) => {
    const roleName = currentEmployee
        .role?.name;
    /* ADMIN / HR */
    if (roleName ===
        "ADMIN" ||
        roleName ===
            "HR") {
        return null;
    }
    /* EMPLOYEE */
    if (roleName ===
        "EMPLOYEE") {
        return [
            currentEmployee.id,
        ];
    }
    /* TEAM LEADER */
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
   CHECK EMPLOYEE ACCESS
============================ */
const checkLeaveEmployeeAccess = async (employeeId, currentEmployee) => {
    const allowedIds = await getLeaveEmployeeIds(currentEmployee);
    /* ADMIN / HR */
    if (allowedIds === null) {
        return;
    }
    if (!allowedIds.includes(employeeId)) {
        throw new Error("Leave Access Denied");
    }
};
/* ============================
   APPLY LEAVE
============================ */
const applyLeave = async (data) => {
    /* ============================
       EMPLOYEE CHECK
    ============================ */
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
        select: {
            id: true,
            employeeCode: true,
            name: true,
            isActive: true,
            status: true,
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
       REQUIRED VALUES
    ============================ */
    if (!data.fromDate ||
        !data.toDate) {
        throw new Error("From Date and To Date are required");
    }
    if (!data.reason?.trim()) {
        throw new Error("Leave Reason is required");
    }
    /* ============================
       DATES
    ============================ */
    const fromDate = startOfDay(data.fromDate);
    const toDate = endOfDay(data.toDate);
    if (fromDate >
        toDate) {
        throw new Error("From Date cannot be greater than To Date");
    }
    /* ============================
       PAST DATE CHECK
    ============================ */
    const today = startOfDay(new Date());
    if (fromDate <
        today) {
        throw new Error("Leave cannot be applied for a past date");
    }
    /* ============================
       OVERLAP CHECK

       REJECTED leave should not
       block a new leave request.
    ============================ */
    const existingLeave = await prisma_1.default.leave.findFirst({
        where: {
            employeeId: data.employeeId,
            status: {
                in: [
                    "PENDING",
                    "APPROVED",
                ],
            },
            fromDate: {
                lte: toDate,
            },
            toDate: {
                gte: fromDate,
            },
        },
    });
    if (existingLeave) {
        throw new Error("Leave already exists for selected dates");
    }
    /* ============================
       CREATE
    ============================ */
    const leave = await prisma_1.default.leave.create({
        data: {
            employeeId: data.employeeId,
            fromDate,
            toDate,
            reason: data.reason.trim(),
            status: "PENDING",
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
/* ============================
   GET LEAVES
============================ */
const getLeaves = async (page, limit, search, status, employeeId, currentEmployee) => {
    const safePage = Math.max(page || 1, 1);
    const safeLimit = Math.min(Math.max(limit || 10, 1), 100);
    const skip = (safePage - 1) *
        safeLimit;
    const where = {};
    /* ============================
       ROLE ACCESS
    ============================ */
    const allowedIds = await getLeaveEmployeeIds(currentEmployee);
    if (allowedIds !== null) {
        where.employeeId = {
            in: allowedIds,
        };
    }
    /* ============================
       EMPLOYEE FILTER
    ============================ */
    if (employeeId) {
        await checkLeaveEmployeeAccess(employeeId, currentEmployee);
        where.employeeId =
            employeeId;
    }
    /* ============================
       STATUS FILTER
    ============================ */
    if (status) {
        if (![
            "PENDING",
            "APPROVED",
            "REJECTED",
        ].includes(status)) {
            throw new Error("Invalid Leave Status");
        }
        where.status =
            status;
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
    const [leaves, total,] = await Promise.all([
        prisma_1.default.leave.findMany({
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
            orderBy: [
                {
                    createdAt: "desc",
                },
            ],
            skip,
            take: safeLimit,
        }),
        prisma_1.default.leave.count({
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
        leaves,
    };
};
exports.getLeaves = getLeaves;
/* ============================
   GET LEAVE BY ID
============================ */
const getLeaveById = async (id, currentEmployee) => {
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
            approvedBy: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
        },
    });
    if (!leave) {
        throw new Error("Leave Not Found");
    }
    /* SECURITY */
    await checkLeaveEmployeeAccess(leave.employeeId, currentEmployee);
    return {
        success: true,
        leave,
    };
};
exports.getLeaveById = getLeaveById;
/* ============================
   UPDATE LEAVE
   ADMIN / HR ONLY
============================ */
const updateLeave = async (id, data) => {
    const leave = await prisma_1.default.leave.findUnique({
        where: {
            id,
        },
    });
    if (!leave) {
        throw new Error("Leave Not Found");
    }
    /* ============================
       DATE VALUES
    ============================ */
    const fromDate = data.fromDate
        ? startOfDay(data.fromDate)
        : leave.fromDate;
    const toDate = data.toDate
        ? endOfDay(data.toDate)
        : leave.toDate;
    if (fromDate >
        toDate) {
        throw new Error("From Date cannot be greater than To Date");
    }
    /* ============================
       OVERLAP CHECK
    ============================ */
    if (data.fromDate ||
        data.toDate) {
        const overlapping = await prisma_1.default.leave.findFirst({
            where: {
                employeeId: leave.employeeId,
                id: {
                    not: id,
                },
                status: {
                    in: [
                        "PENDING",
                        "APPROVED",
                    ],
                },
                fromDate: {
                    lte: toDate,
                },
                toDate: {
                    gte: fromDate,
                },
            },
        });
        if (overlapping) {
            throw new Error("Another leave already exists for selected dates");
        }
    }
    /* ============================
       UPDATE
    ============================ */
    const updatedLeave = await prisma_1.default.leave.update({
        where: {
            id,
        },
        data: {
            fromDate,
            toDate,
            reason: data.reason !==
                undefined
                ? data.reason.trim()
                : leave.reason,
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
/* ============================
   APPROVE / REJECT LEAVE
============================ */
const approveRejectLeave = async (id, status, approvedById, currentEmployee) => {
    /* ============================
       LEAVE
    ============================ */
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
                    reportingManagerId: true,
                },
            },
        },
    });
    if (!leave) {
        throw new Error("Leave Not Found");
    }
    if (leave.status !==
        "PENDING") {
        throw new Error("Leave has already been processed");
    }
    /* ============================
       STATUS VALIDATION
    ============================ */
    if (status !==
        "APPROVED" &&
        status !==
            "REJECTED") {
        throw new Error("Invalid Leave Decision");
    }
    /* ============================
       NO SELF APPROVAL
    ============================ */
    if (leave.employeeId ===
        approvedById) {
        throw new Error("You cannot approve or reject your own leave");
    }
    /* ============================
       ROLE APPROVAL ACCESS
    ============================ */
    const roleName = currentEmployee
        .role?.name;
    if (roleName !==
        "ADMIN" &&
        roleName !==
            "HR" &&
        roleName !==
            "TEAM_LEADER") {
        throw new Error("Leave Approval Access Denied");
    }
    /* ============================
       TEAM LEADER
       CAN ONLY PROCESS TEAM
    ============================ */
    if (roleName ===
        "TEAM_LEADER") {
        if (leave.employee
            .reportingManagerId !==
            currentEmployee.id) {
            throw new Error("You can only process leave requests of your team members");
        }
    }
    /* ============================
       APPROVER VALIDATION
    ============================ */
    const approver = await prisma_1.default.employee.findUnique({
        where: {
            id: approvedById,
        },
        select: {
            id: true,
            employeeCode: true,
            name: true,
            isActive: true,
        },
    });
    if (!approver) {
        throw new Error("Approver Not Found");
    }
    if (!approver.isActive) {
        throw new Error("Approver Account Inactive");
    }
    /* ============================
       UPDATE LEAVE

       Attendance calendar does
       NOT need rows created here.

       Monthly Attendance Report
       derives APPROVED leave
       automatically.
    ============================ */
    const updatedLeave = await prisma_1.default.$transaction(async (transaction) => {
        const result = await transaction.leave.updateMany({
            where: {
                id,
                status: "PENDING",
            },
            data: {
                status,
                approvedById,
            },
        });
        if (result.count ===
            0) {
            throw new Error("Leave has already been processed");
        }
        return transaction.leave.findUnique({
            where: {
                id,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
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
        });
    });
    return {
        success: true,
        message: status ===
            "APPROVED"
            ? "Leave Approved Successfully"
            : "Leave Rejected Successfully",
        leave: updatedLeave,
    };
};
exports.approveRejectLeave = approveRejectLeave;
