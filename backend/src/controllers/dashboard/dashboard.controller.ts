import {
  Request,
  Response,
} from "express";

import * as dashboardService from "../../services/dashboard/dashboard.service";

export const getDashboardStats =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentEmployee =
        (req as any)
          .employee;

      if (!currentEmployee) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });

        return;
      }

      const result =
        await dashboardService.getDashboardStats(
          currentEmployee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({
          success: false,
          message:
            error.message ||
            "Dashboard Error",
        });
    }
  };