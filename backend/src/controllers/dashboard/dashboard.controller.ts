import { Request, Response } from "express";
import * as dashboardService from "../../services/dashboard/dashboard.service";

export const getDashboardStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await dashboardService.getDashboardStats();

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Dashboard Error",
    });
  }
};