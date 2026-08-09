import { Request, Response } from "express";
import * as leaveService from "../../services/leave/leave.service";
import strict from "node:assert/strict";

/* ============================
   APPLY LEAVE
============================ */

export const applyLeave = async (
  req: Request,
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
  req: Request,
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

    const result = await leaveService.getLeaves(
      page,
      limit,
      search,
      status
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await leaveService.getLeaveById(id as string);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   UPDATE LEAVE
============================ */

export const updateLeave = async (
  req: Request,
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
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, approvedById } = req.body;

    const result =
      await leaveService.approveRejectLeave(
        id as string,
        status,
        approvedById
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};