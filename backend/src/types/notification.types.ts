import { NotificationType } from "@prisma/client";

export interface CreateNotificationRequest {
  employeeId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  isRead?: boolean;
}

export interface UpdateNotificationRequest {
  employeeId?: string;
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
}