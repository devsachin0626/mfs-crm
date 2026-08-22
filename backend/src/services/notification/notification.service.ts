import prisma from "../../config/prisma";
import { CreateNotificationRequest,UpdateNotificationRequest } from "../../types/notification.types";

export const createNotification = async (
  data: CreateNotificationRequest
) => {
  const notification = await prisma.notification.create({
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

export const getNotifications = async (
  page: number,
  limit: number,
  employeeId?: string,
  isRead?: boolean
) => {
  const skip = (page - 1) * limit;

  const where: {
    employeeId?: string;
    isRead?: boolean;
  } = {};

  // Employee-wise notifications
  if (employeeId) {
    where.employeeId = employeeId;
  }

  // Read / Unread filter
  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  // Total notifications
  const total = await prisma.notification.count({
    where,
  });

  // Notifications
  const notifications = await prisma.notification.findMany({
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

export const getNotificationById = async (id: string) => {
  const notification = await prisma.notification.findUnique({
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

export const updateNotification = async (
  id: string,
  data: UpdateNotificationRequest
) => {
  // Check Notification Exists
  const existingNotification = await prisma.notification.findUnique({
    where: {
      id,
    },
  });

  if (!existingNotification) {
    throw new Error("Notification Not Found");
  }

  // Update Notification
  const notification = await prisma.notification.update({
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

export const deleteNotification = async (id: string) => {
  // Check Notification Exists
  const existingNotification = await prisma.notification.findUnique({
    where: {
      id,
    },
  });

  if (!existingNotification) {
    throw new Error("Notification Not Found");
  }

  // Delete Notification
  const notification = await prisma.notification.delete({
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