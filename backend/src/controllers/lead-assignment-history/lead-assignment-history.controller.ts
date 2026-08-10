import { Request, Response } from "express";

import {
  createLeadAssignmentHistory,
  getLeadAssignmentHistories,
  getLeadAssignmentHistoryById,
  updateLeadAssignmentHistory,
  deleteLeadAssignmentHistory,
} from "../../services/lead-assignment-history/lead-assignment-history.service";

/**
 * Create Lead Assignment History
 */
export const createLeadAssignmentHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createLeadAssignmentHistory(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Lead Assignment History Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to create lead assignment history",
    });
  }
};

/**
 * Get All Lead Assignment Histories
 */
export const getLeadAssignmentHistoriesController = async (
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

    const result = await getLeadAssignmentHistories(
      page,
      limit,
      leadId,
      employeeId
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Lead Assignment Histories Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch lead assignment histories",
    });
  }
};

/**
 * Get Lead Assignment History By ID
 */
export const getLeadAssignmentHistoryByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getLeadAssignmentHistoryById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(
      "Get Lead Assignment History By ID Error:",
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error.message || "Lead Assignment History Not Found",
    });
  }
};

/**
 * Update Lead Assignment History
 */
export const updateLeadAssignmentHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateLeadAssignmentHistory(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Lead Assignment History Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to update lead assignment history",
    });
  }
};

/**
 * Delete Lead Assignment History
 */
export const deleteLeadAssignmentHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteLeadAssignmentHistory(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Lead Assignment History Error:", error);

    return res.status(404).json({
      success: false,
      message:
        error.message || "Lead Assignment History Not Found",
    });
  }
};