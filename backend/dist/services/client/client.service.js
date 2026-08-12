"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLeadToClient = exports.updateClient = exports.getClientById = exports.getClients = exports.createClient = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
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
    if (query.isActive !== undefined) {
        where.isActive = query.isActive === "true";
    }
    const [clients, total] = await Promise.all([
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
        prisma_1.default.client.count({ where }),
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
const getClientById = async (id) => {
    const client = await prisma_1.default.client.findUnique({
        where: {
            id,
        },
        include: {
            lead: true,
            orders: true,
            services: true,
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
const updateClient = async (id, data) => {
    const existingClient = await prisma_1.default.client.findUnique({
        where: { id },
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
        where: { id },
        data,
    });
    return {
        success: true,
        message: "Client Updated Successfully",
        client,
    };
};
exports.updateClient = updateClient;
const convertLeadToClient = async (leadId) => {
    // Lead Check
    const lead = await prisma_1.default.lead.findUnique({
        where: {
            id: leadId,
        },
    });
    if (!lead) {
        throw new Error("Lead Not Found");
    }
    // Already Converted
    if (lead.isConverted) {
        throw new Error("Lead Already Converted");
    }
    // Client Code
    const totalClients = await prisma_1.default.client.count();
    const clientCode = `CLI${String(totalClients + 1).padStart(5, "0")}`;
    // Create Client
    const client = await prisma_1.default.client.create({
        data: {
            clientCode,
            leadId: lead.id,
            name: lead.name || "Unknown",
            mobile: lead.mobile,
            email: lead.email,
            city: lead.city,
            state: lead.state,
            address: lead.address,
        },
    });
    // Update Lead
    await prisma_1.default.lead.update({
        where: {
            id: lead.id,
        },
        data: {
            isConverted: true,
            stage: "CONVERTED",
        },
    });
    return {
        success: true,
        message: "Lead Converted Successfully",
        client,
    };
};
exports.convertLeadToClient = convertLeadToClient;
