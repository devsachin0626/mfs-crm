"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeTrial = exports.extendTrial = exports.getTrialById = exports.getTrials = exports.startTrial = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const startTrial = async (data) => {
    // Client Check
    const client = await prisma_1.default.client.findUnique({
        where: {
            id: data.clientId,
        },
    });
    if (!client) {
        throw new Error("Client Not Found");
    }
    // Product Check
    const product = await prisma_1.default.product.findUnique({
        where: {
            id: data.productId,
        },
    });
    if (!product) {
        throw new Error("Product Not Found");
    }
    if (!product.isTrialAvailable) {
        throw new Error("Trial Not Available For This Product");
    }
    // Employee Check
    if (data.employeeId) {
        const employee = await prisma_1.default.employee.findUnique({
            where: {
                id: data.employeeId,
            },
        });
        if (!employee) {
            throw new Error("Employee Not Found");
        }
    }
    // Active Trial Check
    const activeTrial = await prisma_1.default.trial.findFirst({
        where: {
            clientId: data.clientId,
            status: "ACTIVE",
        },
    });
    if (activeTrial) {
        throw new Error("Client Already Has Active Trial");
    }
    // Trial Code
    const totalTrials = await prisma_1.default.trial.count();
    const trialCode = `TR${String(totalTrials + 1).padStart(5, "0")}`;
    // Dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + data.trialDays);
    // Create Trial
    const trial = await prisma_1.default.trial.create({
        data: {
            trialCode,
            clientId: data.clientId,
            productId: data.productId,
            employeeId: data.employeeId,
            startDate,
            endDate,
            trialDays: data.trialDays,
            remarks: data.remarks,
        },
    });
    return {
        success: true,
        message: "Trial Started Successfully",
        trial,
    };
};
exports.startTrial = startTrial;
const getTrials = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const total = await prisma_1.default.trial.count();
    const trials = await prisma_1.default.trial.findMany({
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            client: true,
            product: true,
            employee: {
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
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        trials,
    };
};
exports.getTrials = getTrials;
const getTrialById = async (id) => {
    const trial = await prisma_1.default.trial.findUnique({
        where: {
            id,
        },
        include: {
            client: true,
            product: true,
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
        },
    });
    if (!trial) {
        throw new Error("Trial Not Found");
    }
    return {
        success: true,
        trial,
    };
};
exports.getTrialById = getTrialById;
const extendTrial = async (id, trialDays) => {
    const trial = await prisma_1.default.trial.findUnique({
        where: {
            id,
        },
    });
    if (!trial) {
        throw new Error("Trial Not Found");
    }
    if (trial.status !== "ACTIVE") {
        throw new Error("Only Active Trial Can Be Extended");
    }
    const endDate = new Date(trial.endDate);
    endDate.setDate(endDate.getDate() + trialDays);
    const updatedTrial = await prisma_1.default.trial.update({
        where: {
            id,
        },
        data: {
            endDate,
            trialDays: trial.trialDays + trialDays,
            extensionCount: {
                increment: 1,
            },
        },
    });
    return {
        success: true,
        message: "Trial Extended Successfully",
        trial: updatedTrial,
    };
};
exports.extendTrial = extendTrial;
const completeTrial = async (id) => {
    const trial = await prisma_1.default.trial.findUnique({
        where: {
            id,
        },
    });
    if (!trial) {
        throw new Error("Trial Not Found");
    }
    if (trial.status === "COMPLETED") {
        throw new Error("Trial Already Completed");
    }
    const updatedTrial = await prisma_1.default.trial.update({
        where: {
            id,
        },
        data: {
            status: "COMPLETED",
        },
    });
    return {
        success: true,
        message: "Trial Completed Successfully",
        trial: updatedTrial,
    };
};
exports.completeTrial = completeTrial;
