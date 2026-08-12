"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeFollowUp = exports.getFollowUps = exports.createFollowUp = exports.changeLeadStatus = exports.assignLead = exports.updateLead = exports.getLeadById = exports.getLeads = exports.createLead = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
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
const getLeads = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    // Search
    if (query.search) {
        where.OR = [
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
    // Status Filter
    if (query.status) {
        where.status = {
            name: query.status,
        };
    }
    // Employee Filter
    if (query.employeeId) {
        where.assignedEmployeeId = query.employeeId;
    }
    // Source Filter
    if (query.source) {
        where.source = {
            name: query.source,
        };
    }
    const [leads, total] = await Promise.all([
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
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        leads,
    };
};
exports.getLeads = getLeads;
const getLeadById = async (id) => {
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id,
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
            histories: {
                orderBy: {
                    createdAt: "desc",
                },
            },
            followUps: {
                orderBy: {
                    followUpDate: "desc",
                },
            },
            client: true,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    return {
        success: true,
        lead,
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
const changeLeadStatus = async (leadId, employeeId, data) => {
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
const createFollowUp = async (leadId, employeeId, data) => {
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
            id: employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Past Date Validation
    if (new Date(data.followUpDate) < new Date()) {
        throw new Error("Follow-up date cannot be in the past");
    }
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Create Follow-up
        const followUp = await tx.followUp.create({
            data: {
                leadId,
                employeeId,
                followUpDate: data.followUpDate,
                remarks: data.remarks,
            },
        });
        // Update Lead
        await tx.lead.update({
            where: {
                id: leadId,
            },
            data: {
                nextFollowUp: data.followUpDate,
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
const getFollowUps = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
    if (query.employeeId) {
        where.employeeId = query.employeeId;
    }
    if (query.isCompleted !== undefined) {
        where.isCompleted = query.isCompleted === "true";
    }
    if (query.search) {
        where.lead = {
            name: {
                contains: query.search,
                mode: "insensitive",
            },
        };
    }
    const [followUps, total] = await Promise.all([
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
        prisma_1.default.followUp.count({ where }),
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
const completeFollowUp = async (followUpId) => {
    const followUp = await prisma_1.default.followUp.findUnique({
        where: { id: followUpId },
    });
    if (!followUp) {
        throw new Error("Follow-up Not Found");
    }
    if (followUp.isCompleted) {
        throw new Error("Follow-up Already Completed");
    }
    const result = await prisma_1.default.$transaction(async (tx) => {
        const updatedFollowUp = await tx.followUp.update({
            where: { id: followUpId },
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
