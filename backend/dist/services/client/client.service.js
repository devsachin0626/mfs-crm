"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLeadToClient = exports.updateClient = exports.getClientById = exports.getClients = exports.createClient = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const leadAccess_1 = require("../../utils/leadAccess");
/* ============================
   CREATE CLIENT
============================ */
const createClient = async (data) => {
    // Mobile Duplicate Check
    const existingClient = await prisma_1.default.client.findFirst({
        where: {
            mobile: data.mobile,
        },
    });
    if (existingClient) {
        throw new Error("Client Already Exists");
    }
    // Lead Validation (Optional)
    if (data.leadId) {
        const lead = await prisma_1.default.lead.findUnique({
            where: {
                id: data.leadId,
            },
        });
        if (!lead) {
            throw new Error("Lead Not Found");
        }
        if (lead.isConverted) {
            throw new Error("Lead Already Converted");
        }
    }
    // Client Code Generate
    const totalClients = await prisma_1.default.client.count();
    const clientCode = `CL${String(totalClients + 1).padStart(5, "0")}`;
    const result = await prisma_1.default.$transaction(async (tx) => {
        const client = await tx.client.create({
            data: {
                clientCode,
                leadId: data.leadId,
                name: data.name,
                mobile: data.mobile,
                email: data.email,
                city: data.city,
                state: data.state,
                address: data.address,
                panNumber: data.panNumber,
                aadhaarNumber: data.aadhaarNumber,
            },
        });
        // Lead → Client Conversion
        if (data.leadId) {
            await tx.lead.update({
                where: {
                    id: data.leadId,
                },
                data: {
                    isConverted: true,
                    stage: "CONVERTED",
                    nextFollowUp: null,
                },
            });
        }
        return client;
    });
    return {
        success: true,
        message: "Client Created Successfully",
        client: result,
    };
};
exports.createClient = createClient;
/* ============================
   GET CLIENTS
============================ */
const getClients = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const where = {};
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
                clientCode: {
                    contains: query.search,
                    mode: "insensitive",
                },
            },
        ];
    }
    if (query.isActive !==
        undefined) {
        where.isActive =
            query.isActive === "true";
    }
    const [clients, total,] = await Promise.all([
        prisma_1.default.client.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                lead: {
                    select: {
                        leadCode: true,
                        name: true,
                    },
                },
            },
        }),
        prisma_1.default.client.count({
            where,
        }),
    ]);
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        clients,
    };
};
exports.getClients = getClients;
/* ============================
   GET CLIENT BY ID
============================ */
const getClientById = async (id) => {
    const client = await prisma_1.default.client.findUnique({
        where: {
            id,
        },
        include: {
            lead: true,
            orders: true,
            services: true,
            trials: true,
        },
    });
    if (!client) {
        throw new Error("Client Not Found");
    }
    return {
        success: true,
        client,
    };
};
exports.getClientById = getClientById;
/* ============================
   UPDATE CLIENT
============================ */
const updateClient = async (id, data) => {
    const existingClient = await prisma_1.default.client.findUnique({
        where: {
            id,
        },
    });
    if (!existingClient) {
        throw new Error("Client Not Found");
    }
    // Mobile Duplicate Check
    if (data.mobile) {
        const mobileExists = await prisma_1.default.client.findFirst({
            where: {
                mobile: data.mobile,
                NOT: {
                    id,
                },
            },
        });
        if (mobileExists) {
            throw new Error("Mobile Number Already Exists");
        }
    }
    const client = await prisma_1.default.client.update({
        where: {
            id,
        },
        data: {
            ...(data.name !==
                undefined && {
                name: data.name,
            }),
            ...(data.mobile !==
                undefined && {
                mobile: data.mobile,
            }),
            ...(data.email !==
                undefined && {
                email: data.email,
            }),
            ...(data.city !==
                undefined && {
                city: data.city,
            }),
            ...(data.state !==
                undefined && {
                state: data.state,
            }),
            ...(data.address !==
                undefined && {
                address: data.address,
            }),
            ...(data.panNumber !==
                undefined && {
                panNumber: data.panNumber,
            }),
            ...(data.aadhaarNumber !==
                undefined && {
                aadhaarNumber: data.aadhaarNumber,
            }),
            ...(data.isActive !==
                undefined && {
                isActive: data.isActive,
            }),
        },
    });
    return {
        success: true,
        message: "Client Updated Successfully",
        client,
    };
};
exports.updateClient = updateClient;
/* ============================
   CONVERT LEAD TO CLIENT
============================ */
const convertLeadToClient = async (leadId, employeeId, data, currentEmployee) => {
    /* ============================
       LEAD ACCESS
    ============================ */
    await (0, leadAccess_1.checkLeadAccess)(leadId, currentEmployee);
    /* ============================
       LEAD CHECK
    ============================ */
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
        include: {
            client: true,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    /* ============================
       ALREADY CONVERTED
    ============================ */
    if (lead.isConverted ||
        lead.client) {
        throw new Error("Lead Already Converted");
    }
    if (lead.stage === "LOST") {
        throw new Error("Lost lead cannot be converted to client");
    }
    /* ============================
       NAME VALIDATION
    ============================ */
    const clientName = lead.name?.trim();
    if (!clientName) {
        throw new Error("Lead name is required before conversion");
    }
    /* ============================
       DUPLICATE CLIENT CHECK
    ============================ */
    const existingClient = await prisma_1.default.client.findFirst({
        where: {
            OR: [
                {
                    mobile: lead.mobile,
                },
                ...(lead.email
                    ? [
                        {
                            email: lead.email,
                        },
                    ]
                    : []),
            ],
        },
    });
    if (existingClient) {
        throw new Error("Client already exists with same mobile or email");
    }
    /* ============================
       TRANSACTION
    ============================ */
    const result = await prisma_1.default.$transaction(async (tx) => {
        /* ============================
           CLIENT CODE
        ============================ */
        const lastClient = await tx.client.findFirst({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                clientCode: true,
            },
        });
        let nextNumber = 1;
        if (lastClient
            ?.clientCode) {
            const match = lastClient.clientCode.match(/(\d+)$/);
            if (match) {
                nextNumber =
                    Number(match[1]) + 1;
            }
        }
        const clientCode = `CL${String(nextNumber).padStart(6, "0")}`;
        /* ============================
           CREATE CLIENT
        ============================ */
        const client = await tx.client.create({
            data: {
                clientCode,
                leadId: lead.id,
                name: clientName,
                mobile: lead.mobile,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                address: lead.address,
                panNumber: data.panNumber,
                aadhaarNumber: data.aadhaarNumber,
                isActive: true,
            },
        });
        /* ============================
CLOSE PENDING FOLLOW-UPS
============================ */
        await tx.followUp.updateMany({
            where: {
                leadId: lead.id,
                isCompleted: false,
            },
            data: {
                isCompleted: true,
            },
        });
        /* ============================
           UPDATE LEAD
        ============================ */
        const updatedLead = await tx.lead.update({
            where: {
                id: lead.id,
            },
            data: {
                isConverted: true,
                stage: "CONVERTED",
                nextFollowUp: null,
            },
        });
        /* ============================
           LEAD HISTORY
        ============================ */
        await tx.leadHistory.create({
            data: {
                leadId: lead.id,
                employeeId,
                remarks: `Lead converted to client ${clientCode}`,
            },
        });
        return {
            client,
            lead: updatedLead,
        };
    });
    return {
        success: true,
        message: "Lead Converted Successfully",
        ...result,
    };
};
exports.convertLeadToClient = convertLeadToClient;
