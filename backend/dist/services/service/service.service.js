"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateService = exports.getServiceById = exports.getServices = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
/* ============================
   GET ALL SERVICES
============================ */
const getServices = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
        where.OR = [
            {
                client: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                product: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }
    const total = await prisma_1.default.serviceActivation.count({
        where,
    });
    const services = await prisma_1.default.serviceActivation.findMany({
        where,
        include: {
            client: true,
            product: true,
            employee: true,
            order: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    });
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        services,
    };
};
exports.getServices = getServices;
/* ============================
   GET SERVICE BY ID
============================ */
const getServiceById = async (id) => {
    const service = await prisma_1.default.serviceActivation.findUnique({
        where: {
            id,
        },
        include: {
            client: true,
            product: true,
            employee: true,
            order: {
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    payments: true,
                },
            },
        },
    });
    if (!service) {
        throw new Error("Service Not Found");
    }
    return {
        success: true,
        service,
    };
};
exports.getServiceById = getServiceById;
/* ============================
   UPDATE SERVICE
============================ */
const updateService = async (id, data) => {
    const service = await prisma_1.default.serviceActivation.findUnique({
        where: {
            id,
        },
    });
    if (!service) {
        throw new Error("Service Not Found");
    }
    const updatedService = await prisma_1.default.serviceActivation.update({
        where: {
            id,
        },
        data: {
            endDate: data.endDate !== undefined
                ? new Date(data.endDate)
                : service.endDate,
            remarks: data.remarks !== undefined
                ? data.remarks
                : service.remarks,
            isActive: data.isActive !== undefined
                ? data.isActive
                : service.isActive,
        },
        include: {
            client: true,
            product: true,
            employee: true,
            order: true,
        },
    });
    return {
        success: true,
        message: "Service Updated Successfully",
        service: updatedService,
    };
};
exports.updateService = updateService;
