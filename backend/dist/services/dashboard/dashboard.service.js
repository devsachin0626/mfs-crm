"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
/* ============================
   ROLE
============================ */
const getRoleName = (employee) => {
    const role = employee?.role;
    if (typeof role ===
        "string") {
        return role;
    }
    return (role?.name || "");
};
/* ============================
   LEAD ACCESS
============================ */
const getLeadAccessWhere = (currentEmployee) => {
    const roleName = getRoleName(currentEmployee);
    /*
     * ADMIN / HR
     * can see all leads.
     */
    if (roleName === "ADMIN" ||
        roleName === "HR") {
        return {};
    }
    /*
     * TEAM LEADER
     * self + direct team.
     */
    if (roleName ===
        "TEAM_LEADER") {
        return {
            OR: [
                {
                    assignedEmployeeId: currentEmployee.id,
                },
                {
                    assignedEmployee: {
                        reportingManagerId: currentEmployee.id,
                    },
                },
            ],
        };
    }
    /*
     * EMPLOYEE
     * only own leads.
     */
    return {
        assignedEmployeeId: currentEmployee.id,
    };
};
/* ============================
   DASHBOARD
============================ */
const getDashboardStats = async (currentEmployee) => {
    const roleName = getRoleName(currentEmployee);
    /* ============================
       DATE RANGE
    ============================ */
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() +
        1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() +
        1, 1);
    const accessWhere = getLeadAccessWhere(currentEmployee);
    /* ============================
       FOLLOW-UP ACCESS

       Follow-up visibility follows
       accessible leads.
    ============================ */
    const followUpAccessWhere = {
        lead: accessWhere,
    };
    /* ============================
       MAIN STATS
    ============================ */
    const [totalLeads, newLeadsToday, convertedLeads, convertedThisMonth, lostLeads, totalFollowUps, pendingFollowUps, todayFollowUps, overdueFollowUps, callsToday, connectedCallsToday, interestedCallsToday, recentLeads, hotLeads,] = await Promise.all([
        /* TOTAL LEADS */
        prisma_1.default.lead.count({
            where: accessWhere,
        }),
        /* NEW LEADS TODAY */
        prisma_1.default.lead.count({
            where: {
                AND: [
                    accessWhere,
                    {
                        createdAt: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                ],
            },
        }),
        /* CONVERTED */
        prisma_1.default.lead.count({
            where: {
                AND: [
                    accessWhere,
                    {
                        stage: "CONVERTED",
                    },
                ],
            },
        }),
        /* CONVERTED THIS MONTH */
        prisma_1.default.lead.count({
            where: {
                AND: [
                    accessWhere,
                    {
                        stage: "CONVERTED",
                        updatedAt: {
                            gte: monthStart,
                            lt: nextMonth,
                        },
                    },
                ],
            },
        }),
        /* LOST */
        prisma_1.default.lead.count({
            where: {
                AND: [
                    accessWhere,
                    {
                        stage: "LOST",
                    },
                ],
            },
        }),
        /* TOTAL FOLLOW UPS */
        prisma_1.default.followUp.count({
            where: followUpAccessWhere,
        }),
        /* PENDING FOLLOW UPS */
        prisma_1.default.followUp.count({
            where: {
                AND: [
                    followUpAccessWhere,
                    {
                        isCompleted: false,
                    },
                ],
            },
        }),
        /* TODAY FOLLOW UPS */
        prisma_1.default.followUp.count({
            where: {
                AND: [
                    followUpAccessWhere,
                    {
                        isCompleted: false,
                        followUpDate: {
                            gte: today,
                            lt: tomorrow,
                        },
                    },
                ],
            },
        }),
        /* OVERDUE */
        prisma_1.default.followUp.count({
            where: {
                AND: [
                    followUpAccessWhere,
                    {
                        isCompleted: false,
                        followUpDate: {
                            lt: today,
                        },
                    },
                ],
            },
        }),
        /* CALLS TODAY */
        prisma_1.default.leadHistory.count({
            where: {
                lead: accessWhere,
                callOutcome: {
                    not: null,
                },
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        }),
        /* CONNECTED TODAY */
        prisma_1.default.leadHistory.count({
            where: {
                lead: accessWhere,
                callOutcome: "CONNECTED",
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        }),
        /* INTERESTED TODAY */
        prisma_1.default.leadHistory.count({
            where: {
                lead: accessWhere,
                callOutcome: "INTERESTED",
                createdAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        }),
        /* RECENT LEADS */
        prisma_1.default.lead.findMany({
            where: accessWhere,
            orderBy: {
                createdAt: "desc",
            },
            take: 5,
            select: {
                id: true,
                leadCode: true,
                name: true,
                mobile: true,
                stage: true,
                createdAt: true,
                assignedEmployee: {
                    select: {
                        id: true,
                        name: true,
                        employeeCode: true,
                    },
                },
            },
        }),
        /* HOT LEADS */
        prisma_1.default.lead.findMany({
            where: {
                AND: [
                    accessWhere,
                    {
                        stage: {
                            in: [
                                "WORKING",
                                "FOLLOW_UP",
                            ],
                        },
                        isConverted: false,
                    },
                ],
            },
            orderBy: [
                {
                    nextFollowUp: "asc",
                },
                {
                    updatedAt: "desc",
                },
            ],
            take: 5,
            select: {
                id: true,
                leadCode: true,
                name: true,
                mobile: true,
                stage: true,
                nextFollowUp: true,
                assignedEmployee: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
    ]);
    /* ============================
       EMPLOYEE COUNT

       Only management needs
       company/team count.
    ============================ */
    let totalEmployees = 1;
    if (roleName === "ADMIN" ||
        roleName === "HR") {
        totalEmployees =
            await prisma_1.default.employee.count({
                where: {
                    isActive: true,
                },
            });
    }
    else if (roleName ===
        "TEAM_LEADER") {
        totalEmployees =
            await prisma_1.default.employee.count({
                where: {
                    isActive: true,
                    OR: [
                        {
                            id: currentEmployee.id,
                        },
                        {
                            reportingManagerId: currentEmployee.id,
                        },
                    ],
                },
            });
    }
    /* ============================
       CALCULATED STATS
    ============================ */
    const openLeads = Math.max(totalLeads -
        convertedLeads -
        lostLeads, 0);
    const conversionRate = totalLeads > 0
        ? Number(((convertedLeads /
            totalLeads) *
            100).toFixed(1))
        : 0;
    /*
     * Daily calling target.
     * We can move this to
     * employee settings later.
     */
    const dailyCallTarget = 250;
    const callProgress = dailyCallTarget > 0
        ? Number(Math.min((callsToday /
            dailyCallTarget) *
            100, 100).toFixed(1))
        : 0;
    const connectRate = callsToday > 0
        ? Number(((connectedCallsToday /
            callsToday) *
            100).toFixed(1))
        : 0;
    /* ============================
TARGET / LEADERBOARD
============================ */
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    let targetEmployeeIds = null;
    if (roleName === "EMPLOYEE") {
        targetEmployeeIds = [
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
        targetEmployeeIds = [
            currentEmployee.id,
            ...teamMembers.map((item) => item.id),
        ];
    }
    /* ============================
       CURRENT TARGETS
    ============================ */
    const targetWhere = {
        month: currentMonth,
        year: currentYear,
    };
    if (targetEmployeeIds !==
        null) {
        targetWhere.employeeId = {
            in: targetEmployeeIds,
        };
    }
    const currentTargets = await prisma_1.default.employeeTarget.findMany({
        where: targetWhere,
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    role: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    /* ============================
       TARGET TOTALS
    ============================ */
    const totalBrokerageTarget = currentTargets.reduce((total, target) => total +
        Number(target.brokerageTarget), 0);
    const totalRevenueTarget = currentTargets.reduce((total, target) => total +
        Number(target.revenueTarget), 0);
    const totalDematTarget = currentTargets.reduce((total, target) => total +
        Number(target.dematTarget), 0);
    const totalAchievement = currentTargets.reduce((total, target) => total +
        Number(target.achievedAmount), 0);
    const targetProgress = totalBrokerageTarget >
        0
        ? Number(((totalAchievement /
            totalBrokerageTarget) *
            100).toFixed(1))
        : 0;
    /* ============================
       LEADERBOARD
    ============================ */
    const leaderboard = currentTargets
        .map((target) => {
        const targetAmount = Number(target.brokerageTarget);
        const achievedAmount = Number(target.achievedAmount);
        const progress = targetAmount > 0
            ? Number(((achievedAmount /
                targetAmount) *
                100).toFixed(1))
            : 0;
        return {
            employeeId: target.employee.id,
            employeeCode: target.employee
                .employeeCode,
            name: target.employee.name,
            role: target.employee
                .role?.name ||
                "",
            brokerageTarget: targetAmount,
            achievedAmount,
            revenueTarget: Number(target.revenueTarget),
            dematTarget: target.dematTarget,
            progress,
        };
    })
        .sort((a, b) => b.progress -
        a.progress)
        .slice(0, 5);
    /* ============================
       RESPONSE
    ============================ */
    return {
        success: true,
        role: roleName,
        stats: {
            totalEmployees,
            totalLeads,
            newLeadsToday,
            openLeads,
            totalFollowUps,
            pendingFollowUps,
            todayFollowUps,
            overdueFollowUps,
            convertedLeads,
            convertedThisMonth,
            lostLeads,
            conversionRate,
            callsToday,
            connectedCallsToday,
            interestedCallsToday,
            dailyCallTarget,
            callProgress,
            connectRate,
        },
        targets: {
            month: currentMonth,
            year: currentYear,
            totalBrokerageTarget,
            totalAchievement,
            totalRevenueTarget,
            totalDematTarget,
            progress: targetProgress,
        },
        leaderboard,
        recentLeads,
        hotLeads,
    };
};
exports.getDashboardStats = getDashboardStats;
