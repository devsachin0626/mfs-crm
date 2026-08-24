"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallingQueue = exports.bulkChangeLeadStatus = exports.bulkChangeLeadStage = exports.bulkAssignLeads = exports.changeLeadStage = exports.getLeadPipeline = exports.getLeadTimeline = exports.getDailyCallingSummary = exports.saveCallOutcome = exports.completeFollowUp = exports.getFollowUps = exports.createFollowUp = exports.changeLeadStatus = exports.assignLead = exports.updateLead = exports.getLeadById = exports.getLeads = exports.createLead = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const leadAging_1 = require("../../utils/leadAging");
const client_1 = require("@prisma/client");
const leadAccess_1 = require("../../utils/leadAccess");
/* ============================
   CALLING HELPERS
============================ */
const getRoleName = (currentEmployee) => {
    if (typeof currentEmployee?.role ===
        "string") {
        return currentEmployee.role;
    }
    return (currentEmployee?.role?.name ||
        "");
};
/* ============================
   CALLING SUMMARY ACCESS

   ADMIN / HR
   -> ANY EMPLOYEE

   TEAM LEADER
   -> SELF + TEAM

   EMPLOYEE
   -> SELF
============================ */
const checkCallingSummaryAccess = async (targetEmployeeId, currentEmployee) => {
    const roleName = getRoleName(currentEmployee);
    if (roleName === "ADMIN" ||
        roleName === "HR") {
        return;
    }
    if (roleName === "EMPLOYEE") {
        if (targetEmployeeId !==
            currentEmployee.id) {
            throw new Error("Calling Summary Access Denied");
        }
        return;
    }
    if (roleName ===
        "TEAM_LEADER") {
        if (targetEmployeeId ===
            currentEmployee.id) {
            return;
        }
        const teamMember = await prisma_1.default.employee.findFirst({
            where: {
                id: targetEmployeeId,
                reportingManagerId: currentEmployee.id,
                isActive: true,
            },
            select: {
                id: true,
            },
        });
        if (!teamMember) {
            throw new Error("Calling Summary Access Denied");
        }
        return;
    }
    throw new Error("Calling Summary Access Denied");
};
/* ============================
   DAILY CALLING TARGET

   Setting key:
   CALLING_DAILY_TARGET

   Default:
   250
============================ */
const getDailyCallingTarget = async () => {
    const setting = await prisma_1.default.setting.findUnique({
        where: {
            key: "CALLING_DAILY_TARGET",
        },
    });
    const configuredTarget = Number(setting?.value);
    if (Number.isFinite(configuredTarget) &&
        configuredTarget > 0) {
        return Math.floor(configuredTarget);
    }
    return 250;
};
const createLead = async (data, createdById) => {
    const { name, mobile, email, city, state, address, sourceId, remarks, assignedEmployeeId, } = data;
    // Required Validation
    if (!mobile) {
        throw new Error("Mobile Number is required");
    }
    // Duplicate Mobile Check
    const mobileExists = await prisma_1.default.lead.findFirst({
        where: {
            mobile,
        },
    });
    if (mobileExists) {
        throw new Error("Lead already exists with this Mobile Number");
    }
    // Duplicate Email Check
    if (email) {
        const emailExists = await prisma_1.default.lead.findFirst({
            where: {
                email,
            },
        });
        if (emailExists) {
            throw new Error("Lead already exists with this Email");
        }
    }
    // Default Status = NEW
    const defaultStatus = await prisma_1.default.leadStatus.findFirst({
        where: {
            name: "NEW",
            isActive: true,
        },
    });
    if (!defaultStatus) {
        throw new Error("Default Lead Status (NEW) not found");
    }
    // Source Validation
    if (sourceId) {
        const source = await prisma_1.default.leadSource.findUnique({
            where: {
                id: sourceId,
            },
        });
        if (!source) {
            throw new Error("Invalid Lead Source");
        }
    }
    // Employee Validation
    if (assignedEmployeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: assignedEmployeeId,
            },
        });
        if (!employee) {
            throw new Error("Assigned Employee not found");
        }
    }
    // Generate Lead Code
    const lastLead = await prisma_1.default.lead.findFirst({
        orderBy: {
            createdAt: "desc",
        },
    });
    let leadCode = "LD00001";
    if (lastLead) {
        const lastNumber = Number(lastLead.leadCode.replace("LD", ""));
        leadCode = `LD${String(lastNumber + 1).padStart(5, "0")}`;
    }
    // Create Lead
    const lead = await prisma_1.default.lead.create({
        data: {
            leadCode,
            name,
            mobile,
            email,
            city,
            state,
            address,
            sourceId,
            remarks,
            assignedEmployeeId,
            statusId: defaultStatus.id,
        },
        include: {
            status: true,
            source: true,
            assignedEmployee: true,
        },
    });
    return {
        success: true,
        message: "Lead Created Successfully",
        lead,
    };
};
exports.createLead = createLead;
const getLeads = async (query, currentEmployee) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    /* ============================
       ROLE BASED ACCESS
    ============================ */
    const accessWhere = await (0, leadAccess_1.getLeadAccessWhere)(currentEmployee);
    where.AND = [
        accessWhere,
    ];
    /* ============================
       SEARCH
    ============================ */
    if (query.search) {
        where.OR = [
            {
                leadCode: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                name: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
            {
                mobile: {
                    contains: query.search,
                },
            },
            {
                email: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];
    }
    /* ============================
       STATUS FILTER
    ============================ */
    if (query.status) {
        where.status = {
            name: query.status,
        };
    }
    /* ============================
       EMPLOYEE FILTER
    ============================ */
    if (query.employeeId) {
        where.assignedEmployeeId =
            query.employeeId;
    }
    /* ============================
       SOURCE FILTER
    ============================ */
    if (query.source) {
        where.source = {
            name: query.source,
        };
    }
    /* ============================
       STAGE FILTER
    ============================ */
    if (query.stage) {
        where.stage =
            query.stage;
    }
    /* ============================
       FOLLOW-UP FILTER
    ============================ */
    if (query.followUp) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() +
            1);
        if (query.followUp ===
            "TODAY") {
            where.nextFollowUp = {
                gte: today,
                lt: tomorrow,
            };
        }
        if (query.followUp ===
            "OVERDUE") {
            where.nextFollowUp = {
                lt: today,
            };
        }
    }
    /* ============================
       SMART VIEWS
    ============================ */
    if (query.smartView) {
        const now = new Date();
        if (query.smartView ===
            "MY_NEW") {
            where.stage =
                "NEW";
            /*
             Role access already makes
             EMPLOYEE see only own leads.
      
             ADMIN / HR / TL can additionally
             use employeeId filter.
            */
        }
        if (query.smartView ===
            "HOT") {
            const next24Hours = new Date(now.getTime() +
                24 *
                    60 *
                    60 *
                    1000);
            /*
             HOT =
             overdue OR due within 24 hours
            */
            where.nextFollowUp = {
                lte: next24Hours,
            };
            where.isConverted =
                false;
        }
        if (query.smartView ===
            "OVERDUE") {
            where.nextFollowUp = {
                lt: now,
            };
            where.isConverted =
                false;
        }
        if (query.smartView ===
            "UNASSIGNED") {
            where.assignedEmployeeId =
                null;
        }
        if (query.smartView ===
            "NO_FOLLOW_UP") {
            where.nextFollowUp =
                null;
            where.isConverted =
                false;
        }
        if (query.smartView ===
            "CONVERTED") {
            where.stage =
                "CONVERTED";
        }
        if (query.smartView ===
            "LOST") {
            where.stage =
                "LOST";
        }
    }
    /* ============================
       GET LEADS
    ============================ */
    const [leads, total,] = await Promise.all([
        prisma_1.default.lead.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                status: true,
                source: true,
                assignedEmployee: {
                    select: {
                        id: true,
                        name: true,
                        employeeCode: true,
                    },
                },
            },
        }),
        prisma_1.default.lead.count({
            where,
        }),
    ]);
    /* ============================
       ADD AGING
    ============================ */
    const leadsWithAging = leads.map((lead) => ({
        ...lead,
        aging: (0, leadAging_1.calculateLeadAging)({
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            lastCallAt: lead.lastCallAt,
            nextFollowUp: lead.nextFollowUp,
        }),
    }));
    /* ============================
       RETURN
    ============================ */
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        leads: leadsWithAging,
    };
};
exports.getLeads = getLeads;
const getLeadById = async (id, currentEmployee) => {
    /* ============================
       ROLE BASED ACCESS
    ============================ */
    const accessWhere = await (0, leadAccess_1.getLeadAccessWhere)(currentEmployee);
    /* ============================
       GET LEAD
    ============================ */
    const lead = await prisma_1.default.lead.findFirst({
        where: {
            AND: [
                {
                    id,
                },
                accessWhere,
            ],
        },
        include: {
            status: true,
            source: true,
            assignedEmployee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    mobile: true,
                    email: true,
                },
            },
            /* ============================
               LEAD STATUS / CALL HISTORY
            ============================ */
            histories: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            employeeCode: true,
                            name: true,
                        },
                    },
                    status: {
                        select: {
                            id: true,
                            name: true,
                            color: true,
                        },
                    },
                },
            },
            /* ============================
               FOLLOW UPS
            ============================ */
            followUps: {
                orderBy: {
                    followUpDate: "desc",
                },
                include: {
                    employee: {
                        select: {
                            id: true,
                            employeeCode: true,
                            name: true,
                        },
                    },
                },
            },
            /* ============================
               ASSIGNMENT HISTORY
            ============================ */
            assignmentHistory: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    fromEmployee: {
                        select: {
                            id: true,
                            employeeCode: true,
                            name: true,
                        },
                    },
                    toEmployee: {
                        select: {
                            id: true,
                            employeeCode: true,
                            name: true,
                        },
                    },
                },
            },
            /* ============================
               CLIENT
            ============================ */
            client: true,
        },
    });
    if (!lead) {
        /*
         Same response for missing lead
         and unauthorized lead.
         This prevents exposing whether
         another employee's lead exists.
        */
        throw new Error("Lead Not Found");
    }
    /* ============================
       ADD AGING
    ============================ */
    const leadWithAging = {
        ...lead,
        aging: (0, leadAging_1.calculateLeadAging)({
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            lastCallAt: lead.lastCallAt,
            nextFollowUp: lead.nextFollowUp,
        }),
    };
    return {
        success: true,
        lead: leadWithAging,
    };
};
exports.getLeadById = getLeadById;
const updateLead = async (id, data) => {
    // Check Lead
    const lead = await prisma_1.default.lead.findUnique({
        where: { id },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    // Mobile Duplicate Check
    if (data.mobile) {
        const mobileExists = await prisma_1.default.lead.findFirst({
            where: {
                mobile: data.mobile,
                NOT: {
                    id,
                },
            },
        });
        if (mobileExists) {
            throw new Error("Mobile Number already exists");
        }
    }
    // Status Validation
    if (data.statusId) {
        const status = await prisma_1.default.leadStatus.findUnique({
            where: {
                id: data.statusId,
            },
        });
        if (!status) {
            throw new Error("Invalid Lead Status");
        }
    }
    // Source Validation
    if (data.sourceId) {
        const source = await prisma_1.default.leadSource.findUnique({
            where: {
                id: data.sourceId,
            },
        });
        if (!source) {
            throw new Error("Invalid Lead Source");
        }
    }
    // Employee Validation
    if (data.assignedEmployeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: data.assignedEmployeeId,
            },
        });
        if (!employee) {
            throw new Error("Invalid Employee");
        }
    }
    const updatedLead = await prisma_1.default.lead.update({
        where: {
            id,
        },
        data: {
            name: data.name,
            mobile: data.mobile,
            email: data.email,
            city: data.city,
            state: data.state,
            address: data.address,
            stage: data.stage,
            nextFollowUp: data.nextFollowUp,
            remarks: data.remarks,
            ...(data.sourceId && {
                source: {
                    connect: {
                        id: data.sourceId,
                    },
                },
            }),
            ...(data.statusId && {
                status: {
                    connect: {
                        id: data.statusId,
                    },
                },
            }),
            ...(data.assignedEmployeeId && {
                assignedEmployee: {
                    connect: {
                        id: data.assignedEmployeeId,
                    },
                },
            }),
        },
        include: {
            status: true,
            source: true,
            assignedEmployee: true,
        },
    });
    return {
        success: true,
        message: "Lead Updated Successfully",
        lead: updatedLead,
    };
};
exports.updateLead = updateLead;
const assignLead = async (leadId, data) => {
    // Check Lead
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    // Check Employee
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Already Assigned
    if (lead.assignedEmployeeId === data.employeeId) {
        throw new Error("Lead Already Assigned To This Employee");
    }
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Update Lead
        const updatedLead = await tx.lead.update({
            where: {
                id: leadId,
            },
            data: {
                assignedEmployee: {
                    connect: {
                        id: data.employeeId,
                    },
                },
            },
        });
        // Save Assignment History
        await tx.leadAssignmentHistory.create({
            data: {
                leadId,
                fromEmployeeId: lead.assignedEmployeeId,
                toEmployeeId: data.employeeId,
            },
        });
        return updatedLead;
    });
    return {
        success: true,
        message: "Lead Assigned Successfully",
        lead: result,
    };
};
exports.assignLead = assignLead;
const changeLeadStatus = async (leadId, employeeId, data, currentEmployee) => {
    await (0, leadAccess_1.checkLeadAccess)(leadId, currentEmployee);
    // Check Lead
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    // Check Status
    const status = await prisma_1.default.leadStatus.findUnique({
        where: {
            id: data.statusId,
        },
    });
    if (!status) {
        throw new Error("Invalid Lead Status");
    }
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Update Lead
        const updatedLead = await tx.lead.update({
            where: {
                id: leadId,
            },
            data: {
                status: {
                    connect: {
                        id: data.statusId,
                    },
                },
                remarks: data.remarks,
                lastCallAt: new Date(),
            },
            include: {
                status: true,
            },
        });
        // Save History
        await tx.leadHistory.create({
            data: {
                leadId,
                employeeId,
                statusId: data.statusId,
                remarks: data.remarks,
            },
        });
        return updatedLead;
    });
    return {
        success: true,
        message: "Lead Status Updated Successfully",
        lead: result,
    };
};
exports.changeLeadStatus = changeLeadStatus;
const createFollowUp = async (leadId, employeeId, data, currentEmployee) => {
    /* ============================
       ACCESS CHECK
    ============================ */
    await (0, leadAccess_1.checkLeadAccess)(leadId, currentEmployee);
    /* ============================
       CHECK LEAD
    ============================ */
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    /* ============================
       CHECK EMPLOYEE
    ============================ */
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    /* ============================
       DATE VALIDATION
    ============================ */
    const followUpDate = new Date(data.followUpDate);
    if (Number.isNaN(followUpDate.getTime())) {
        throw new Error("Invalid Follow-up Date");
    }
    if (followUpDate <
        new Date()) {
        throw new Error("Follow-up date cannot be in the past");
    }
    /* ============================
       TRANSACTION
    ============================ */
    const result = await prisma_1.default.$transaction(async (tx) => {
        const followUp = await tx.followUp.create({
            data: {
                leadId,
                employeeId,
                followUpDate,
                remarks: data.remarks,
            },
        });
        await tx.lead.update({
            where: {
                id: leadId,
            },
            data: {
                nextFollowUp: followUpDate,
            },
        });
        return followUp;
    });
    return {
        success: true,
        message: "Follow-up Created Successfully",
        followUp: result,
    };
};
exports.createFollowUp = createFollowUp;
const getFollowUps = async (query, currentEmployee) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    /* ============================
       ROLE BASED ACCESS
    ============================ */
    const accessWhere = await (0, leadAccess_1.getLeadAccessWhere)(currentEmployee);
    where.lead = {
        AND: [
            accessWhere,
        ],
    };
    /* ============================
       EMPLOYEE FILTER
    ============================ */
    if (query.employeeId) {
        where.employeeId =
            query.employeeId;
    }
    /* ============================
       COMPLETED FILTER
    ============================ */
    if (query.isCompleted !==
        undefined) {
        where.isCompleted =
            query.isCompleted ===
                "true";
    }
    /* ============================
       SEARCH
    ============================ */
    if (query.search) {
        where.lead = {
            AND: [
                accessWhere,
                {
                    OR: [
                        {
                            name: {
                                contains: query.search,
                                mode: "insensitive",
                            },
                        },
                        {
                            leadCode: {
                                contains: query.search,
                                mode: "insensitive",
                            },
                        },
                        {
                            mobile: {
                                contains: query.search,
                            },
                        },
                    ],
                },
            ],
        };
    }
    /* ============================
       DATE FILTERS
    ============================ */
    if (query.view) {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() +
            1);
        if (query.view ===
            "TODAY") {
            where.followUpDate = {
                gte: today,
                lt: tomorrow,
            };
            where.isCompleted =
                false;
        }
        if (query.view ===
            "OVERDUE") {
            where.followUpDate = {
                lt: now,
            };
            where.isCompleted =
                false;
        }
        if (query.view ===
            "UPCOMING") {
            where.followUpDate = {
                gte: tomorrow,
            };
            where.isCompleted =
                false;
        }
    }
    /* ============================
       GET DATA
    ============================ */
    const [followUps, total,] = await Promise.all([
        prisma_1.default.followUp.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                followUpDate: "asc",
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        leadCode: true,
                        name: true,
                        mobile: true,
                        email: true,
                        city: true,
                        status: {
                            select: {
                                id: true,
                                name: true,
                                color: true,
                            },
                        },
                        assignedEmployee: {
                            select: {
                                id: true,
                                employeeCode: true,
                                name: true,
                            },
                        },
                    },
                },
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
            },
        }),
        prisma_1.default.followUp.count({
            where,
        }),
    ]);
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
const completeFollowUp = async (followUpId, currentEmployee) => {
    const followUp = await prisma_1.default.followUp.findUnique({
        where: {
            id: followUpId,
        },
    });
    if (!followUp) {
        throw new Error("Follow-up Not Found");
    }
    /* ============================
       ACCESS CHECK
    ============================ */
    await (0, leadAccess_1.checkLeadAccess)(followUp.leadId, currentEmployee);
    if (followUp.isCompleted) {
        throw new Error("Follow-up Already Completed");
    }
    const result = await prisma_1.default.$transaction(async (tx) => {
        const updatedFollowUp = await tx.followUp.update({
            where: {
                id: followUpId,
            },
            data: {
                isCompleted: true,
            },
        });
        await tx.lead.update({
            where: {
                id: followUp.leadId,
            },
            data: {
                nextFollowUp: null,
            },
        });
        return updatedFollowUp;
    });
    return {
        success: true,
        message: "Follow-up Completed Successfully",
        followUp: result,
    };
};
exports.completeFollowUp = completeFollowUp;
const saveCallOutcome = async (leadId, employeeId, data, currentEmployee) => {
    /* ============================
       ACCESS
    ============================ */
    await (0, leadAccess_1.checkLeadAccess)(leadId, currentEmployee);
    /* ============================
       LEAD
    ============================ */
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
        select: {
            id: true,
            leadCode: true,
            assignedEmployeeId: true,
            stage: true,
            isConverted: true,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    if (lead.isConverted) {
        throw new Error("Converted Lead Cannot Be Called");
    }
    /* ============================
       EMPLOYEE
    ============================ */
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
        select: {
            id: true,
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
       OUTCOME VALIDATION
    ============================ */
    if (!data.outcome ||
        !Object.values(client_1.CallOutcome).includes(data.outcome)) {
        throw new Error("Invalid Call Outcome");
    }
    /* ============================
       STATUS VALIDATION
    ============================ */
    if (data.statusId) {
        const status = await prisma_1.default.leadStatus.findUnique({
            where: {
                id: data.statusId,
            },
            select: {
                id: true,
                isActive: true,
            },
        });
        if (!status ||
            !status.isActive) {
            throw new Error("Invalid Lead Status");
        }
    }
    /* ============================
       FOLLOW-UP RULES
    ============================ */
    const requiresFollowUp = data.outcome ===
        "CALL_BACK" ||
        data.outcome ===
            "INTERESTED";
    if (requiresFollowUp &&
        !data.followUpDate) {
        throw new Error("Follow-up date is required for this call outcome");
    }
    let followUpDate;
    if (data.followUpDate) {
        followUpDate =
            new Date(data.followUpDate);
        if (Number.isNaN(followUpDate.getTime())) {
            throw new Error("Invalid Follow-up Date");
        }
        if (followUpDate <=
            new Date()) {
            throw new Error("Follow-up date must be in the future");
        }
    }
    /* ============================
       AUTO STAGE RULES
    ============================ */
    const shouldMarkLost = data.outcome ===
        "NOT_INTERESTED" ||
        data.outcome ===
            "WRONG_NUMBER";
    /* ============================
       TRANSACTION
    ============================ */
    const result = await prisma_1.default.$transaction(async (tx) => {
        /* ============================
           FOLLOW-UP MANAGEMENT

           Only one active follow-up
           should remain after call.
        ============================ */
        if (followUpDate) {
            await tx.followUp.updateMany({
                where: {
                    leadId,
                    isCompleted: false,
                },
                data: {
                    isCompleted: true,
                },
            });
        }
        if (shouldMarkLost) {
            await tx.followUp.updateMany({
                where: {
                    leadId,
                    isCompleted: false,
                },
                data: {
                    isCompleted: true,
                },
            });
        }
        /* ============================
           UPDATE LEAD

           Call remarks are NOT written
           into lead.remarks.

           Remarks remain in history.
        ============================ */
        const updatedLead = await tx.lead.update({
            where: {
                id: leadId,
            },
            data: {
                lastCallAt: new Date(),
                ...(data.statusId && {
                    status: {
                        connect: {
                            id: data.statusId,
                        },
                    },
                }),
                ...(followUpDate && {
                    nextFollowUp: followUpDate,
                }),
                ...(shouldMarkLost && {
                    stage: "LOST",
                    nextFollowUp: null,
                }),
            },
            include: {
                status: true,
                source: true,
                assignedEmployee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
            },
        });
        /* ============================
           CALL HISTORY
        ============================ */
        const history = await tx.leadHistory.create({
            data: {
                leadId,
                employeeId,
                statusId: data.statusId,
                callOutcome: data.outcome,
                remarks: data.remarks
                    ?.trim() ||
                    undefined,
            },
        });
        /* ============================
           CREATE NEW FOLLOW-UP
        ============================ */
        let followUp = null;
        if (followUpDate) {
            followUp =
                await tx.followUp.create({
                    data: {
                        leadId,
                        employeeId,
                        followUpDate,
                        remarks: data.remarks
                            ?.trim() ||
                            undefined,
                    },
                });
        }
        return {
            lead: updatedLead,
            history,
            followUp,
        };
    });
    return {
        success: true,
        message: shouldMarkLost
            ? "Call Saved And Lead Marked As Lost"
            : followUpDate
                ? "Call Saved And Follow-up Scheduled"
                : "Call Outcome Saved Successfully",
        ...result,
    };
};
exports.saveCallOutcome = saveCallOutcome;
const getDailyCallingSummary = async (employeeId, currentEmployee) => {
    /* ============================
       ACCESS
    ============================ */
    await checkCallingSummaryAccess(employeeId, currentEmployee);
    /* ============================
       EMPLOYEE
    ============================ */
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
        select: {
            id: true,
            employeeCode: true,
            name: true,
            isActive: true,
        },
    });
    if (!employee ||
        !employee.isActive) {
        throw new Error("Employee Not Found");
    }
    /* ============================
       TODAY
    ============================ */
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() +
        1);
    /* ============================
       CALL DATA
    ============================ */
    const [todayCalls, outcomeGroups, dailyTarget,] = await Promise.all([
        prisma_1.default.leadHistory.count({
            where: {
                employeeId,
                callOutcome: {
                    not: null,
                },
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        }),
        prisma_1.default.leadHistory.groupBy({
            by: [
                "callOutcome",
            ],
            where: {
                employeeId,
                callOutcome: {
                    not: null,
                },
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            _count: {
                _all: true,
            },
        }),
        getDailyCallingTarget(),
    ]);
    /* ============================
       OUTCOME COUNTS
    ============================ */
    const outcomes = {};
    Object.values(client_1.CallOutcome).forEach((outcome) => {
        outcomes[outcome] = 0;
    });
    outcomeGroups.forEach((item) => {
        if (item.callOutcome) {
            outcomes[item.callOutcome] =
                item._count._all;
        }
    });
    /* ============================
       SUMMARY
    ============================ */
    const remaining = Math.max(dailyTarget -
        todayCalls, 0);
    const achievementPercent = dailyTarget > 0
        ? Number((todayCalls /
            dailyTarget *
            100).toFixed(2))
        : 0;
    return {
        success: true,
        employee: {
            id: employee.id,
            employeeCode: employee.employeeCode,
            name: employee.name,
        },
        date: startOfDay,
        summary: {
            todayCalls,
            dailyTarget,
            remaining,
            achievementPercent,
            outcomes,
        },
    };
};
exports.getDailyCallingSummary = getDailyCallingSummary;
const getLeadTimeline = async (leadId, currentEmployee) => {
    /* ============================
       ACCESS CHECK
    ============================ */
    await (0, leadAccess_1.checkLeadAccess)(leadId, currentEmployee);
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
        select: {
            id: true,
            leadCode: true,
            isConverted: true,
            createdAt: true,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    const [histories, followUps, assignments,] = await Promise.all([
        prisma_1.default.leadHistory.findMany({
            where: {
                leadId,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
                status: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        }),
        prisma_1.default.followUp.findMany({
            where: {
                leadId,
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
            },
        }),
        prisma_1.default.leadAssignmentHistory.findMany({
            where: {
                leadId,
            },
            include: {
                fromEmployee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
                toEmployee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
            },
        }),
    ]);
    const timeline = [];
    /* ============================
       CALL + STATUS HISTORY
    ============================ */
    histories.forEach((item) => {
        if (item.callOutcome) {
            timeline.push({
                id: `call-${item.id}`,
                type: "CALL",
                title: `Call - ${item.callOutcome.replaceAll("_", " ")}`,
                description: item.remarks ||
                    undefined,
                createdAt: item.createdAt,
                employee: item.employee,
                meta: {
                    callOutcome: item.callOutcome,
                    status: item.status,
                },
            });
        }
        else {
            timeline.push({
                id: `status-${item.id}`,
                type: "STATUS",
                title: item.status
                    ? `Status changed to ${item.status.name}`
                    : "Lead updated",
                description: item.remarks ||
                    undefined,
                createdAt: item.createdAt,
                employee: item.employee,
                meta: {
                    status: item.status,
                },
            });
        }
    });
    /* ============================
       FOLLOW UPS
    ============================ */
    followUps.forEach((item) => {
        timeline.push({
            id: `followup-${item.id}`,
            type: item.isCompleted
                ? "FOLLOW_UP_COMPLETED"
                : "FOLLOW_UP",
            title: item.isCompleted
                ? "Follow-up Completed"
                : "Follow-up Scheduled",
            description: item.remarks ||
                undefined,
            createdAt: item.createdAt,
            employee: item.employee,
            meta: {
                followUpDate: item.followUpDate,
                isCompleted: item.isCompleted,
            },
        });
    });
    /* ============================
       ASSIGNMENT HISTORY
    ============================ */
    assignments.forEach((item) => {
        timeline.push({
            id: `assignment-${item.id}`,
            type: "ASSIGNMENT",
            title: item.fromEmployee
                ? `Lead transferred to ${item.toEmployee.name}`
                : `Lead assigned to ${item.toEmployee.name}`,
            description: item.reason ||
                undefined,
            createdAt: item.createdAt,
            employee: item.toEmployee,
            meta: {
                fromEmployee: item.fromEmployee,
                toEmployee: item.toEmployee,
            },
        });
    });
    /* ============================
       CONVERSION
    ============================ */
    if (lead.isConverted) {
        timeline.push({
            id: `conversion-${lead.id}`,
            type: "CONVERSION",
            title: "Lead Converted to Client",
            createdAt: lead.createdAt,
            employee: null,
        });
    }
    /* ============================
       SORT DESC
    ============================ */
    timeline.sort((a, b) => new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime());
    return {
        success: true,
        total: timeline.length,
        timeline,
    };
};
exports.getLeadTimeline = getLeadTimeline;
/* ============================
   GET LEAD PIPELINE
============================ */
const getLeadPipeline = async (employeeId, search, currentEmployee) => {
    const where = {};
    /* ============================
       ROLE BASED ACCESS
    ============================ */
    const accessWhere = await (0, leadAccess_1.getLeadAccessWhere)(currentEmployee);
    where.AND = [
        accessWhere,
    ];
    /* ============================
       EMPLOYEE FILTER
    ============================ */
    if (employeeId) {
        where.assignedEmployeeId =
            employeeId;
    }
    /* ============================
       SEARCH
    ============================ */
    if (search) {
        where.OR = [
            {
                leadCode: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                mobile: {
                    contains: search,
                },
            },
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }
    /* ============================
       GET LEADS
    ============================ */
    const leads = await prisma_1.default.lead.findMany({
        where,
        orderBy: [
            {
                nextFollowUp: "asc",
            },
            {
                updatedAt: "desc",
            },
        ],
        include: {
            status: true,
            source: true,
            assignedEmployee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
        },
    });
    /* ============================
       ADD AGING
    ============================ */
    const enrichedLeads = leads.map((lead) => ({
        ...lead,
        aging: (0, leadAging_1.calculateLeadAging)({
            createdAt: lead.createdAt,
            updatedAt: lead.updatedAt,
            lastCallAt: lead.lastCallAt,
            nextFollowUp: lead.nextFollowUp,
        }),
    }));
    /* ============================
       BUILD PIPELINE
    ============================ */
    const pipeline = {
        NEW: enrichedLeads.filter((lead) => lead.stage ===
            "NEW"),
        WORKING: enrichedLeads.filter((lead) => lead.stage ===
            "WORKING"),
        FOLLOW_UP: enrichedLeads.filter((lead) => lead.stage ===
            "FOLLOW_UP"),
        CONVERTED: enrichedLeads.filter((lead) => lead.stage ===
            "CONVERTED"),
        LOST: enrichedLeads.filter((lead) => lead.stage ===
            "LOST"),
    };
    /* ============================
       RETURN
    ============================ */
    return {
        success: true,
        total: enrichedLeads.length,
        counts: {
            NEW: pipeline.NEW.length,
            WORKING: pipeline.WORKING.length,
            FOLLOW_UP: pipeline.FOLLOW_UP
                .length,
            CONVERTED: pipeline.CONVERTED
                .length,
            LOST: pipeline.LOST.length,
        },
        pipeline,
    };
};
exports.getLeadPipeline = getLeadPipeline;
/* ============================
   CHANGE LEAD STAGE
============================ */
const changeLeadStage = async (leadId, employeeId, data, currentEmployee) => {
    /* ============================
       ACCESS CHECK
    ============================ */
    await (0, leadAccess_1.checkLeadAccess)(leadId, currentEmployee);
    /* ============================
       GET LEAD
    ============================ */
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
        include: {
            assignedEmployee: true,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    /* ============================
       SAME STAGE CHECK
    ============================ */
    if (lead.stage ===
        data.stage) {
        throw new Error("Lead is already in this stage");
    }
    const oldStage = lead.stage;
    /* ============================
       UPDATE
    ============================ */
    const result = await prisma_1.default.$transaction(async (tx) => {
        const updatedLead = await tx.lead.update({
            where: {
                id: leadId,
            },
            data: {
                stage: data.stage,
                ...(data.stage ===
                    "CONVERTED" && {
                    isConverted: true,
                }),
                ...(data.stage !==
                    "CONVERTED" && {
                    isConverted: false,
                }),
            },
            include: {
                status: true,
                source: true,
                assignedEmployee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
            },
        });
        await tx.leadHistory.create({
            data: {
                leadId,
                employeeId,
                remarks: data.remarks ||
                    `Stage changed from ${oldStage} to ${data.stage}`,
            },
        });
        return updatedLead;
    });
    return {
        success: true,
        message: "Lead Stage Updated Successfully",
        previousStage: oldStage,
        stage: data.stage,
        lead: result,
    };
};
exports.changeLeadStage = changeLeadStage;
/* ============================
   BULK ASSIGN LEADS
============================ */
const bulkAssignLeads = async (data) => {
    if (!data.leadIds ||
        data.leadIds.length === 0) {
        throw new Error("Please select at least one lead");
    }
    const uniqueLeadIds = [
        ...new Set(data.leadIds),
    ];
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
        select: {
            id: true,
            employeeCode: true,
            name: true,
            isActive: true,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    if (!employee.isActive) {
        throw new Error("Cannot assign leads to inactive employee");
    }
    const leads = await prisma_1.default.lead.findMany({
        where: {
            id: {
                in: uniqueLeadIds,
            },
        },
        select: {
            id: true,
            assignedEmployeeId: true,
        },
    });
    if (leads.length !==
        uniqueLeadIds.length) {
        throw new Error("One or more selected leads were not found");
    }
    const changedLeads = leads.filter((lead) => lead.assignedEmployeeId !==
        data.employeeId);
    if (changedLeads.length === 0) {
        throw new Error("All selected leads are already assigned to this employee");
    }
    await prisma_1.default.$transaction(async (tx) => {
        for (const lead of changedLeads) {
            await tx.lead.update({
                where: {
                    id: lead.id,
                },
                data: {
                    assignedEmployeeId: data.employeeId,
                },
            });
            await tx.leadAssignmentHistory.create({
                data: {
                    leadId: lead.id,
                    fromEmployeeId: lead.assignedEmployeeId,
                    toEmployeeId: data.employeeId,
                    reason: data.reason ||
                        "Bulk assignment",
                },
            });
        }
    });
    return {
        success: true,
        message: `${changedLeads.length} leads assigned successfully`,
        updated: changedLeads.length,
        skipped: leads.length -
            changedLeads.length,
    };
};
exports.bulkAssignLeads = bulkAssignLeads;
/* ============================
   BULK CHANGE STAGE
============================ */
const bulkChangeLeadStage = async (data, employeeId) => {
    if (!data.leadIds ||
        data.leadIds.length === 0) {
        throw new Error("Please select at least one lead");
    }
    const uniqueLeadIds = [
        ...new Set(data.leadIds),
    ];
    const leads = await prisma_1.default.lead.findMany({
        where: {
            id: {
                in: uniqueLeadIds,
            },
        },
        select: {
            id: true,
            stage: true,
        },
    });
    if (leads.length !==
        uniqueLeadIds.length) {
        throw new Error("One or more selected leads were not found");
    }
    const changedLeads = leads.filter((lead) => lead.stage !==
        data.stage);
    await prisma_1.default.$transaction(async (tx) => {
        for (const lead of changedLeads) {
            await tx.lead.update({
                where: {
                    id: lead.id,
                },
                data: {
                    stage: data.stage,
                    isConverted: data.stage ===
                        "CONVERTED",
                },
            });
            /*
             IMPORTANT:
             callOutcome intentionally
             NOT saved here.
             Therefore Daily Call Counter
             will NOT increase.
            */
            await tx.leadHistory.create({
                data: {
                    leadId: lead.id,
                    employeeId,
                    remarks: data.remarks ||
                        `Bulk stage change: ${lead.stage} → ${data.stage}`,
                },
            });
        }
    });
    return {
        success: true,
        message: `${changedLeads.length} leads moved successfully`,
        updated: changedLeads.length,
        skipped: leads.length -
            changedLeads.length,
    };
};
exports.bulkChangeLeadStage = bulkChangeLeadStage;
/* ============================
   BULK CHANGE STATUS
============================ */
const bulkChangeLeadStatus = async (data, employeeId) => {
    if (!data.leadIds ||
        data.leadIds.length === 0) {
        throw new Error("Please select at least one lead");
    }
    const uniqueLeadIds = [
        ...new Set(data.leadIds),
    ];
    const status = await prisma_1.default.leadStatus.findUnique({
        where: {
            id: data.statusId,
        },
    });
    if (!status) {
        throw new Error("Invalid Lead Status");
    }
    const leads = await prisma_1.default.lead.findMany({
        where: {
            id: {
                in: uniqueLeadIds,
            },
        },
        select: {
            id: true,
            statusId: true,
        },
    });
    if (leads.length !==
        uniqueLeadIds.length) {
        throw new Error("One or more selected leads were not found");
    }
    const changedLeads = leads.filter((lead) => lead.statusId !==
        data.statusId);
    await prisma_1.default.$transaction(async (tx) => {
        for (const lead of changedLeads) {
            await tx.lead.update({
                where: {
                    id: lead.id,
                },
                data: {
                    statusId: data.statusId,
                },
            });
            /*
             Status history yes.
             Call outcome NO.
            */
            await tx.leadHistory.create({
                data: {
                    leadId: lead.id,
                    employeeId,
                    statusId: data.statusId,
                    remarks: data.remarks ||
                        `Bulk status changed to ${status.name}`,
                },
            });
        }
    });
    return {
        success: true,
        message: `${changedLeads.length} leads updated successfully`,
        updated: changedLeads.length,
        skipped: leads.length -
            changedLeads.length,
    };
};
exports.bulkChangeLeadStatus = bulkChangeLeadStatus;
/* ============================
 CALLING QUEUE
============================ */
const getCallingQueue = async (query, currentEmployee) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const skip = (page - 1) *
        limit;
    /* ============================
       ACCESS
    ============================ */
    const accessWhere = await (0, leadAccess_1.getLeadAccessWhere)(currentEmployee);
    const where = {
        AND: [
            accessWhere,
            {
                isConverted: false,
            },
            {
                stage: {
                    notIn: [
                        "LOST",
                        "CONVERTED",
                    ],
                },
            },
        ],
    };
    /* ============================
       OPTIONAL EMPLOYEE FILTER
    ============================ */
    if (query.employeeId) {
        const roleName = typeof currentEmployee
            .role ===
            "string"
            ? currentEmployee
                .role
            : currentEmployee
                .role?.name;
        if (roleName ===
            "EMPLOYEE") {
            if (query.employeeId !==
                currentEmployee.id) {
                throw new Error("Calling Queue Access Denied");
            }
        }
        if (roleName ===
            "TEAM_LEADER") {
            const allowed = await prisma_1.default.employee.findFirst({
                where: {
                    id: query.employeeId,
                    OR: [
                        {
                            id: currentEmployee.id,
                        },
                        {
                            reportingManagerId: currentEmployee.id,
                        },
                    ],
                },
                select: {
                    id: true,
                },
            });
            if (!allowed) {
                throw new Error("Calling Queue Access Denied");
            }
        }
        where.AND.push({
            assignedEmployeeId: query.employeeId,
        });
    }
    /* ============================
       SEARCH
    ============================ */
    if (query.search) {
        where.AND.push({
            OR: [
                {
                    leadCode: {
                        contains: query.search,
                        mode: "insensitive",
                    },
                },
                {
                    name: {
                        contains: query.search,
                        mode: "insensitive",
                    },
                },
                {
                    mobile: {
                        contains: query.search,
                    },
                },
                {
                    email: {
                        contains: query.search,
                        mode: "insensitive",
                    },
                },
            ],
        });
    }
    /* ============================
       FETCH ACTIONABLE LEADS
    ============================ */
    const [leads, total,] = await Promise.all([
        prisma_1.default.lead.findMany({
            where,
            skip,
            take: limit,
            include: {
                status: true,
                source: true,
                assignedEmployee: {
                    select: {
                        id: true,
                        employeeCode: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                {
                    nextFollowUp: "asc",
                },
                {
                    lastCallAt: "asc",
                },
                {
                    createdAt: "asc",
                },
            ],
        }),
        prisma_1.default.lead.count({
            where,
        }),
    ]);
    /* ============================
       PRIORITY
    ============================ */
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() +
        1);
    const queue = leads
        .map((lead) => {
        let priority = 4;
        let queueType = "GENERAL";
        if (lead.nextFollowUp &&
            lead.nextFollowUp <
                now) {
            priority =
                1;
            queueType =
                "OVERDUE";
        }
        else if (lead.nextFollowUp &&
            lead.nextFollowUp >=
                startOfToday &&
            lead.nextFollowUp <
                endOfToday) {
            priority =
                2;
            queueType =
                "TODAY";
        }
        else if (lead.stage ===
            "NEW") {
            priority =
                3;
            queueType =
                "NEW";
        }
        return {
            ...lead,
            queueType,
            priority,
            aging: (0, leadAging_1.calculateLeadAging)({
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt,
                lastCallAt: lead.lastCallAt,
                nextFollowUp: lead.nextFollowUp,
            }),
        };
    })
        .sort((a, b) => {
        if (a.priority !==
            b.priority) {
            return (a.priority -
                b.priority);
        }
        const aFollowUp = a.nextFollowUp
            ? new Date(a.nextFollowUp).getTime()
            : Number.MAX_SAFE_INTEGER;
        const bFollowUp = b.nextFollowUp
            ? new Date(b.nextFollowUp).getTime()
            : Number.MAX_SAFE_INTEGER;
        return (aFollowUp -
            bFollowUp);
    });
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total /
            limit),
        queue,
    };
};
exports.getCallingQueue = getCallingQueue;
