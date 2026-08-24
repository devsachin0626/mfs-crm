import {
  Response,
} from "express";

import {
  AuthRequest,
} from "../../middleware/auth.middleware";

import {
  PayrollStatus,
} from "@prisma/client";

import {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  previewPayroll
} from "../../services/payroll/payroll.service";

/* ============================
   CREATE PAYROLL
============================ */

export const createPayrollController =
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

      const result =
        await createPayroll(
          req.body,
          req.employee
        );

      res.status(201).json(
        result
      );
    } catch (error: any) {
      console.error(
        "Create Payroll Error:",
        error
      );

      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Failed to create payroll",
      });
    }
  };

/* ============================
   GET PAYROLLS
============================ */

export const getPayrollsController =
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

      const page =
        Number(
          req.query.page
        ) || 1;

      const limit =
        Number(
          req.query.limit
        ) || 10;

      const search =
        typeof req.query
          .search === "string"
          ? req.query.search
          : undefined;

      const employeeId =
        typeof req.query
          .employeeId ===
        "string"
          ? req.query
              .employeeId
          : undefined;

      const month =
        req.query.month
          ? Number(
              req.query.month
            )
          : undefined;

      const year =
        req.query.year
          ? Number(
              req.query.year
            )
          : undefined;

      const status =
        typeof req.query
          .status === "string"
          ? (req.query
              .status as PayrollStatus)
          : undefined;

      const result =
        await getPayrolls(
          page,
          limit,
          search,
          month,
          year,
          status,
          employeeId,
          req.employee
        );

      res.status(200).json(
        result
      );
    } catch (error: any) {
      console.error(
        "Get Payrolls Error:",
        error
      );

      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Failed to fetch payrolls",
      });
    }
  };

/* ============================
   GET PAYROLL BY ID
============================ */

export const getPayrollByIdController =
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

      const id =
        req.params.id as string;

      const result =
        await getPayrollById(
          id,
          req.employee
        );

      res.status(200).json(
        result
      );
    } catch (error: any) {
      console.error(
        "Get Payroll By ID Error:",
        error
      );

      res.status(404).json({
        success: false,

        message:
          error.message ||
          "Payroll Not Found",
      });
    }
  };

/* ============================
   UPDATE PAYROLL
============================ */

export const updatePayrollController =
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

      const id =
        req.params.id as string;

      const result =
        await updatePayroll(
          id,
          req.body,
          req.employee
        );

      res.status(200).json(
        result
      );
    } catch (error: any) {
      console.error(
        "Update Payroll Error:",
        error
      );

      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Failed to update payroll",
      });
    }
  };


  /* ============================
   PAYROLL PREVIEW
============================ */

export const previewPayrollController =
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

      const {
        employeeId,
        month,
        year,
        incentive,
        bonus,
        deduction,
      } = req.body;

      if (!employeeId) {
        res.status(400).json({
          success: false,
          message:
            "Employee is required",
        });

        return;
      }

      const result =
        await previewPayroll(
          employeeId,
          Number(month),
          Number(year),
          Number(
            incentive || 0
          ),
          Number(
            bonus || 0
          ),
          Number(
            deduction || 0
          ),
          req.employee
        );

      res.status(200).json(
        result
      );
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Payroll Preview Failed",
      });
    }
  };