"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.getNotificationById = exports.getNotifications = exports.createNotification = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createNotification = async (data) => {
    const notification = await prisma_1.default.notification.create({
        data: {
            employeeId: data.employeeId,
            title: data.title,
            message: data.message,
            type: data.type,
            isRead: data.isRead ?? false,
        },
    });
    return {
        success: true,
        message: "Notification Created Successfully",
        notification,
    };
};
exports.createNotification = createNotification;
const getNotifications = async (page, limit, employeeId, isRead) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Employee-wise notifications
    if (employeeId) {
        where.employeeId = employeeId;
    }
    // Read / Unread filter
    if (isRead !== undefined) {
        where.isRead = isRead;
    }
    // Total notifications
    const total = await prisma_1.default.notification.count({
        where,
    });
    // Notifications
    const notifications = await prisma_1.default.notification.findMany({
        where,
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
        notifications,
    };
};
exports.getNotifications = getNotifications;
const getNotificationById = async (id) => {
    const notification = await prisma_1.default.notification.findUnique({
        where: {
            id,
        },
    });
    if (!notification) {
        throw new Error("Notification Not Found");
    }
    return {
        success: true,
        notification,
    };
};
exports.getNotificationById = getNotificationById;
const updateNotification = async (id, data) => {
    // Check Notification Exists
    const existingNotification = await prisma_1.default.notification.findUnique({
        where: {
            id,
        },
    });
    if (!existingNotification) {
        throw new Error("Notification Not Found");
    }
    // Update Notification
    const notification = await prisma_1.default.notification.update({
        where: {
            id,
        },
        data: {
            ...(data.employeeId !== undefined && {
                employeeId: data.employeeId,
            }),
            ...(data.title !== undefined && {
                title: data.title,
            }),
            ...(data.message !== undefined && {
                message: data.message,
            }),
            ...(data.type !== undefined && {
                type: data.type,
            }),
            ...(data.isRead !== undefined && {
                isRead: data.isRead,
            }),
        },
    });
    return {
        success: true,
        message: "Notification Updated Successfully",
        notification,
    };
};
exports.updateNotification = updateNotification;
const deleteNotification = async (id) => {
    // Check Notification Exists
    const existingNotification = await prisma_1.default.notification.findUnique({
        where: {
            id,
        },
    });
    if (!existingNotification) {
        throw new Error("Notification Not Found");
    }
    // Delete Notification
    const notification = await prisma_1.default.notification.delete({
        where: {
            id,
        },
    });
    return {
        success: true,
        message: "Notification Deleted Successfully",
        notification,
    };
};
exports.deleteNotification = deleteNotification;
