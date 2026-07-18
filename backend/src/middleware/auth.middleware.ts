import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  employee?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access Token Required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const payload = verifyToken(token);

    const employee = await prisma.employee.findUnique({
      where: {
        id: payload.id,
      },
      include: {
        role: true,
        branch: true,
      },
    });

    if (!employee) {
      res.status(401).json({
        success: false,
        message: "Employee Not Found",
      });
      return;
    }

    if (!employee.isActive || employee.status !== "ACTIVE") {
      res.status(401).json({
        success: false,
        message: "Employee Account Inactive",
      });
      return;
    }

    req.employee = employee;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
};