import { Response } from "express";
import * as leaveService from "../../services/leave/leave.service";
import { AuthRequest } from "../../middleware/auth.middleware";

/* ============================
   APPLY LEAVE
============================ */

export const applyLeave = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await leaveService.applyLeave(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   GET ALL LEAVES
============================ */

export const getLeaves = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const employeeId =
      typeof req.query.employeeId === "string"
        ? req.query.employeeId
        : undefined;

    const result = await leaveService.getLeaves(
      page,
      limit,
      search,
      status,
      employeeId,
      req.employee!.id,
      req.employee!.role.name
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   GET LEAVE BY ID
============================ */

export const getLeaveById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await leaveService.getLeaveById(
      id as string,
      req.employee!.id,
      req.employee!.role.name
    );

    res.status(200).json(result);
  } catch (error: any) {
    const statusCode =
      error.message === "Access Denied"
        ? 403
        : 404;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   UPDATE LEAVE
============================ */

export const updateLeave = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await leaveService.updateLeave(
      id as string,
      req.body
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   APPROVE / REJECT LEAVE
============================ */

export const approveRejectLeave = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result =
      await leaveService.approveRejectLeave(
        id as string,
        status,
        req.employee!.id,
        req.employee!.role.name
      );

    res.status(200).json(result);
  } catch (error: any) {
    const statusCode =
      error.message === "Access Denied" ||
      error.message ===
        "You cannot approve or reject your own leave"
        ? 403
        : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};
