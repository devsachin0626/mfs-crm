import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const authorize =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const employeeRole = req.employee.role.name;

    if (!roles.includes(employeeRole)) {
      res.status(403).json({
        success: false,
        message: "Access Denied",
      });
      return;
    }

    next();
  };