"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification/notification.controller");
const router = (0, express_1.Router)();
// Create Notification
router.post("/", notification_controller_1.createNotificationController);
// Get All Notifications
router.get("/", notification_controller_1.getNotificationsController);
// Get Notification By ID
router.get("/:id", notification_controller_1.getNotificationByIdController);
// Update Notification
router.put("/:id", notification_controller_1.updateNotificationController);
// Delete Notification
router.delete("/:id", notification_controller_1.deleteNotificationController);
exports.default = router;
