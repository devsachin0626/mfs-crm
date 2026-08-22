"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationController = exports.updateNotificationController = exports.getNotificationByIdController = exports.getNotificationsController = exports.createNotificationController = void 0;
const notification_service_1 = require("../../services/notification/notification.service");
/**
 * Create Notification
 */
const createNotificationController = async (req, res) => {
    try {
        const result = await (0, notification_service_1.createNotification)(req.body);
        return res.status(201).json(result);
    }
    catch (error) {
        console.error("Create Notification Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create notification",
        });
    }
};
exports.createNotificationController = createNotificationController;
/**
 * Get All Notifications
 */
const getNotificationsController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const employeeId = req.query.employeeId
            ? String(req.query.employeeId)
            : undefined;
        let isRead;
        if (req.query.isRead !== undefined) {
            isRead = String(req.query.isRead) === "true";
        }
        const result = await (0, notification_service_1.getNotifications)(page, limit, employeeId, isRead);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Notifications Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notifications",
        });
    }
};
exports.getNotificationsController = getNotificationsController;
/**
 * Get Notification By ID
 */
const getNotificationByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, notification_service_1.getNotificationById)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get Notification By ID Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Notification Not Found",
        });
    }
};
exports.getNotificationByIdController = getNotificationByIdController;
/**
 * Update Notification
 */
const updateNotificationController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, notification_service_1.updateNotification)(id, req.body);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Update Notification Error:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update notification",
        });
    }
};
exports.updateNotificationController = updateNotificationController;
/**
 * Delete Notification
 */
const deleteNotificationController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await (0, notification_service_1.deleteNotification)(id);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Delete Notification Error:", error);
        return res.status(404).json({
            success: false,
            message: error.message || "Notification Not Found",
        });
    }
};
exports.deleteNotificationController = deleteNotificationController;
