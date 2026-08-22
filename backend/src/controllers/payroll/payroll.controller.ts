import { Request, Response } from "express";

import {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
} from "../../services/payroll/payroll.service";

import { PayrollStatus } from "@prisma/client";

/**
 * Create Payroll
 */
export const createPayrollController = async (
  req: Request,
  res: Response
) => {
  try {
    const payroll = await createPayroll(req.body);

    return res.status(201).json(payroll);
  } catch (error: any) {
    console.error("Create Payroll Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create payroll",
    });
  }
};

/**
 * Get All Payrolls
 */
export const getPayrollsController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search
      ? String(req.query.search)
      : undefined;

      const employeeId =
  typeof req.query.employeeId === "string"
    ? req.query.employeeId
    : undefined;

    const month = req.query.month
      ? Number(req.query.month)
      : undefined;

    const year = req.query.year
      ? Number(req.query.year)
      : undefined;

    const status = req.query.status
      ? (String(req.query.status) as PayrollStatus)
      : undefined;

    const result = await getPayrolls(
      page,
      limit,
      search,
      month,
      year,
      status,
      employeeId
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Payrolls Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payrolls",
    });
  }
};

/**
 * Get Payroll By ID
 */
export const getPayrollByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getPayrollById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Payroll By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Payroll Not Found",
    });
  }
};

/**
 * Update Payroll
 */
export const updatePayrollController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updatePayroll(id as string, req.body);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Payroll Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update payroll",
    });
  }
};