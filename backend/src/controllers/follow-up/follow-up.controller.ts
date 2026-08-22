import { Request, Response } from "express";

import {
  createFollowUp,
  getFollowUps,
  getFollowUpById,
  updateFollowUp,
  deleteFollowUp,
} from "../../services/follow-up/follow-up.service";

/**
 * Create Follow Up
 */
export const createFollowUpController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createFollowUp(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Follow Up Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create follow up",
    });
  }
};

/**
 * Get All Follow Ups
 */
export const getFollowUpsController = async (
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

    let isCompleted: boolean | undefined;

    if (req.query.isCompleted !== undefined) {
      isCompleted = String(req.query.isCompleted) === "true";
    }

    const result = await getFollowUps(
      page,
      limit,
      leadId,
      employeeId,
      isCompleted
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Follow Ups Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch follow ups",
    });
  }
};

/**
 * Get Follow Up By ID
 */
export const getFollowUpByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getFollowUpById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Follow Up By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Follow Up Not Found",
    });
  }
};

/**
 * Update Follow Up
 */
export const updateFollowUpController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateFollowUp(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Follow Up Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update follow up",
    });
  }
};

/**
 * Delete Follow Up
 */
export const deleteFollowUpController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteFollowUp(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Follow Up Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Follow Up Not Found",
    });
  }
};