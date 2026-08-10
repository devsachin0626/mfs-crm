import { Router } from "express";

import {
  createNotificationController,
  getNotificationsController,
  getNotificationByIdController,
  updateNotificationController,
  deleteNotificationController,
} from "../controllers/notification/notification.controller";

const router = Router();

// Create Notification
router.post("/", createNotificationController);

// Get All Notifications
router.get("/", getNotificationsController);

// Get Notification By ID
router.get("/:id", getNotificationByIdController);

// Update Notification
router.put("/:id", updateNotificationController);

// Delete Notification
router.delete("/:id", deleteNotificationController);

export default router;