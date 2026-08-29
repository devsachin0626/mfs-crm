import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as authService from "../../services/auth/auth.service";

// Login
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Login Failed",
    });
  }
};

// Current Logged In Employee
export const me = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      employee: req.employee,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (
      req.authPayload
        ?.impersonatorId
    ) {
      res.status(403).json({
        success: false,
        message:
          "Password cannot be changed during an impersonated session",
      });

      return;
    }

    const { oldPassword, newPassword } = req.body;

    const result = await authService.changePassword(
      req.employee!.id,
      oldPassword,
      newPassword
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Password Change Failed",
    });
  }
};

export const resetEmployeePassword =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const {
        employeeCode,
        newPassword,
      } = req.body;

      const result =
        await authService.resetEmployeePassword(
          employeeCode,
          newPassword
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };

export const impersonateEmployee =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      if (
        req.authPayload
          ?.impersonatorId
      ) {
        res.status(403).json({
          success: false,
          message:
            "Nested impersonation is not allowed",
        });

        return;
      }

      const employeeId =
        req.params
          .employeeId as string;

      const result =
        await authService.impersonateEmployee(
          req.employee.id,
          employeeId,
          {
            ipAddress:
              req.ip,

            userAgent:
              req.get(
                "user-agent"
              ),
          }
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message ||
            "Login as employee failed",
        });
    }
  };
