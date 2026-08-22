import { Request, Response } from "express";

import {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "../../services/notification/notification.service";

/**
 * Create Notification
 */
export const createNotificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createNotification(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Notification Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create notification",
    });
  }
};

/**
 * Get All Notifications
 */
export const getNotificationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const employeeId = req.query.employeeId
      ? String(req.query.employeeId)
      : undefined;

    let isRead: boolean | undefined;

    if (req.query.isRead !== undefined) {
      isRead = String(req.query.isRead) === "true";
    }

    const result = await getNotifications(
      page,
      limit,
      employeeId,
      isRead
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

/**
 * Get Notification By ID
 */
export const getNotificationByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getNotificationById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Notification By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Notification Not Found",
    });
  }
};

/**
 * Update Notification
 */
export const updateNotificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateNotification(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Notification Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update notification",
    });
  }
};

/**
 * Delete Notification
 */
export const deleteNotificationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteNotification(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Notification Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Notification Not Found",
    });
  }
};