"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const createOrder = async (data) => {
    // Client Check
    const client = await prisma_1.default.client.findUnique({
        where: {
            id: data.clientId,
        },
    });
    if (!client) {
        throw new Error("Client Not Found");
    }
    // Employee Check
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    if (!data.items || data.items.length === 0) {
        throw new Error("Order Items Required");
    }
    let subtotal = 0;
    const orderItems = [];
    for (const item of data.items) {
        const product = await prisma_1.default.product.findUnique({
            where: {
                id: item.productId,
            },
        });
        if (!product) {
            throw new Error("Product Not Found");
        }
        const price = Number(product.price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;
        orderItems.push({
            product: {
                connect: {
                    id: product.id,
                },
            },
            quantity: item.quantity,
            price: product.price,
            gst: product.gst,
            total: new client_1.Prisma.Decimal(itemTotal),
        });
    }
    const discountAmount = data.discount || 0;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * 0.18;
    const totalAmount = taxableAmount + gstAmount;
    const count = await prisma_1.default.clientOrder.count();
    const orderNumber = `ORD${String(count + 1).padStart(5, "0")}`;
    const order = await prisma_1.default.clientOrder.create({
        data: {
            orderNumber,
            client: {
                connect: {
                    id: data.clientId,
                },
            },
            employee: {
                connect: {
                    id: data.employeeId,
                },
            },
            orderStatus: "PENDING",
            subtotal: new client_1.Prisma.Decimal(subtotal),
            discountPercent: null,
            discountAmount: new client_1.Prisma.Decimal(discountAmount),
            gstAmount: new client_1.Prisma.Decimal(gstAmount),
            totalAmount: new client_1.Prisma.Decimal(totalAmount),
            notes: data.remarks,
            items: {
                create: orderItems,
            },
        },
        include: {
            client: true,
            employee: true,
            items: {
                include: {
                    product: true,
                },
            },
            payments: true,
        },
    });
    return {
        success: true,
        message: "Order Created Successfully",
        order,
    };
};
exports.createOrder = createOrder;
const getOrders = async (page, limit, search) => {
    const skip = (page - 1) * limit;
    const where = {};
    if (search) {
        where.OR = [
            {
                orderNumber: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                client: {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }
    const total = await prisma_1.default.clientOrder.count({
        where,
    });
    const orders = await prisma_1.default.clientOrder.findMany({
        where,
        include: {
            client: true,
            employee: true,
            items: {
                include: {
                    product: true,
                },
            },
            payments: true,
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
        orders,
    };
};
exports.getOrders = getOrders;
const getOrderById = async (id) => {
    const order = await prisma_1.default.clientOrder.findUnique({
        where: {
            id,
        },
        include: {
            client: true,
            employee: true,
            items: {
                include: {
                    product: true,
                },
            },
            payments: true,
            serviceActivations: true,
        },
    });
    if (!order) {
        throw new Error("Order Not Found");
    }
    return {
        success: true,
        order,
    };
};
exports.getOrderById = getOrderById;
const updateOrder = async (id, data) => {
    const order = await prisma_1.default.clientOrder.findUnique({
        where: {
            id,
        },
    });
    if (!order) {
        throw new Error("Order Not Found");
    }
    const subtotal = Number(order.subtotal);
    const discountAmount = data.discount ?? Number(order.discountAmount);
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * 0.18;
    const totalAmount = taxableAmount + gstAmount;
    const updatedOrder = await prisma_1.default.clientOrder.update({
        where: {
            id,
        },
        data: {
            discountAmount: new client_1.Prisma.Decimal(discountAmount),
            gstAmount: new client_1.Prisma.Decimal(gstAmount),
            totalAmount: new client_1.Prisma.Decimal(totalAmount),
            notes: data.remarks ?? order.notes,
        },
        include: {
            client: true,
            employee: true,
            items: {
                include: {
                    product: true,
                },
            },
            payments: true,
        },
    });
    return {
        success: true,
        message: "Order Updated Successfully",
        order: updatedOrder,
    };
};
exports.updateOrder = updateOrder;
const cancelOrder = async (id) => {
    const order = await prisma_1.default.clientOrder.findUnique({
        where: {
            id,
        },
    });
    if (!order) {
        throw new Error("Order Not Found");
    }
    if (order.orderStatus === "CANCELLED") {
        throw new Error("Order Already Cancelled");
    }
    const updatedOrder = await prisma_1.default.clientOrder.update({
        where: {
            id,
        },
        data: {
            orderStatus: "CANCELLED",
        },
        include: {
            client: true,
            employee: true,
            items: {
                include: {
                    product: true,
                },
            },
            payments: true,
        },
    });
    return {
        success: true,
        message: "Order Cancelled Successfully",
        order: updatedOrder,
    };
};
exports.cancelOrder = cancelOrder;
