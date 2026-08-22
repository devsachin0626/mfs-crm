"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.updatePayment = exports.getPaymentById = exports.getPayments = exports.createPayment = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const createPayment = async (data) => {
    // Order Check
    const order = await prisma_1.default.clientOrder.findUnique({
        where: {
            id: data.orderId,
        },
        include: {
            payments: true,
        },
    });
    if (!order) {
        throw new Error("Order Not Found");
    }
    // Cancelled Order Check
    if (order.orderStatus === "CANCELLED") {
        throw new Error("Payment cannot be created for cancelled order");
    }
    // Amount Validation
    const payableAmount = Number(order.totalAmount);
    if (data.amount <= 0) {
        throw new Error("Invalid Payment Amount");
    }
    if (data.amount > payableAmount) {
        throw new Error("Payment Amount cannot exceed Order Amount");
    }
    // Payment Number
    const count = await prisma_1.default.payment.count();
    const paymentNumber = `PAY${String(count + 1).padStart(5, "0")}`;
    // Create Payment
    const payment = await prisma_1.default.payment.create({
        data: {
            paymentNumber,
            order: {
                connect: {
                    id: data.orderId,
                },
            },
            amount: new client_1.Prisma.Decimal(data.amount),
            paymentMode: data.paymentMode,
            paymentStatus: "PENDING",
            transactionId: data.transactionId,
            remarks: data.remarks,
        },
        include: {
            order: {
                include: {
                    client: true,
                    employee: true,
                },
            },
        },
    });
    return {
        success: true,
        message: "Payment Created Successfully",
        payment,
    };
};
exports.createPayment = createPayment;
const getPayments = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
        where.OR = [
            {
                paymentNumber: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                order: {
                    orderNumber: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            {
                order: {
                    client: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            },
        ];
    }
    const total = await prisma_1.default.payment.count({
        where,
    });
    const payments = await prisma_1.default.payment.findMany({
        where,
        include: {
            order: {
                include: {
                    client: true,
                    employee: true,
                },
            },
            verification: true,
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
        payments,
    };
};
exports.getPayments = getPayments;
const getPaymentById = async (id) => {
    const payment = await prisma_1.default.payment.findUnique({
        where: {
            id,
        },
        include: {
            order: {
                include: {
                    client: true,
                    employee: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
            verification: true,
        },
    });
    if (!payment) {
        throw new Error("Payment Not Found");
    }
    return {
        success: true,
        payment,
    };
};
exports.getPaymentById = getPaymentById;
const updatePayment = async (id, data) => {
    const payment = await prisma_1.default.payment.findUnique({
        where: {
            id,
        },
    });
    if (!payment) {
        throw new Error("Payment Not Found");
    }
    const updatedPayment = await prisma_1.default.payment.update({
        where: {
            id,
        },
        data: {
            paymentMode: data.paymentMode ?? payment.paymentMode,
            transactionId: data.transactionId ?? payment.transactionId,
            remarks: data.remarks ?? payment.remarks,
            screenshot: data.screenshot ?? payment.screenshot,
        },
        include: {
            order: {
                include: {
                    client: true,
                    employee: true,
                },
            },
            verification: true,
        },
    });
    return {
        success: true,
        message: "Payment Updated Successfully",
        payment: updatedPayment,
    };
};
exports.updatePayment = updatePayment;
const verifyPayment = async (paymentId, verifiedById, remarks) => {
    return await prisma_1.default.$transaction(async (tx) => {
        // Payment Check
        const payment = await tx.payment.findUnique({
            where: {
                id: paymentId,
            },
            include: {
                order: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payment) {
            throw new Error("Payment Not Found");
        }
        if (payment.paymentStatus === client_1.PaymentStatus.PAID) {
            throw new Error("Payment Already Verified");
        }
        // Update Payment Status
        const updatedPayment = await tx.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                paymentStatus: client_1.PaymentStatus.PAID,
            },
        });
        // Create Verification Record
        await tx.paymentVerification.create({
            data: {
                paymentId: payment.id,
                verifiedById,
                status: client_1.PaymentStatus.PAID,
                remarks,
            },
        });
        // Update Order Status
        await tx.clientOrder.update({
            where: {
                id: payment.orderId,
            },
            data: {
                orderStatus: "ACTIVE",
            },
        });
        // Create Service Activations
        for (const item of payment.order.items) {
            const startDate = new Date();
            let endDate = null;
            if (item.product.durationDays) {
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + item.product.durationDays);
            }
            const existingActivation = await tx.serviceActivation.findFirst({
                where: {
                    clientId: payment.order.clientId,
                    productId: item.productId,
                    isActive: true,
                },
            });
            if (existingActivation) {
                throw new Error(`${item.product.name} service is already active for this client`);
            }
            await tx.serviceActivation.create({
                data: {
                    clientId: payment.order.clientId,
                    productId: item.productId,
                    orderId: payment.order.id,
                    employeeId: payment.order.employeeId,
                    startDate,
                    endDate,
                    remarks: "Service Activated After Payment Verification",
                },
            });
        }
        return {
            success: true,
            message: "Payment Verified Successfully",
            payment: updatedPayment,
        };
    });
};
exports.verifyPayment = verifyPayment;
