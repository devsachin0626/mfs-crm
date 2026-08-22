import { Request, Response } from "express";

import {
  createLeadHistory,
  getLeadHistories,
  getLeadHistoryById,
  updateLeadHistory,
  deleteLeadHistory,
} from "../../services/lead-history/lead-history.service";

/**
 * Create Lead History
 */
export const createLeadHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createLeadHistory(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Lead History Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create lead history",
    });
  }
};

/**
 * Get All Lead Histories
 */
export const getLeadHistoriesController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const leadId = req.query.leadId
      ? String(req.query.leadId)
      : undefined;

    const employeeId = req.query.employeeId
      ? String(req.query.employeeId)
      : undefined;

    const statusId = req.query.statusId
      ? String(req.query.statusId)
      : undefined;

    const result = await getLeadHistories(
      page,
      limit,
      leadId,
      employeeId,
      statusId
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Lead Histories Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lead histories",
    });
  }
};

/**
 * Get Lead History By ID
 */
export const getLeadHistoryByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getLeadHistoryById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Lead History By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Lead History Not Found",
    });
  }
};

/**
 * Update Lead History
 */
export const updateLeadHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateLeadHistory(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Lead History Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update lead history",
    });
  }
};

/**
 * Delete Lead History
 */
export const deleteLeadHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteLeadHistory(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Lead History Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Lead History Not Found",
    });
  }
};