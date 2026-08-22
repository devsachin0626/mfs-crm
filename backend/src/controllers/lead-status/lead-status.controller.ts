import { Request, Response } from "express";

import {
  createLeadStatus,
  getLeadStatuses,
  getLeadStatusById,
  updateLeadStatus,
  deleteLeadStatus,
} from "../../services/lead-status/lead-status.service";

/**
 * Create Lead Status
 */
export const createLeadStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createLeadStatus(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Lead Status Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create lead status",
    });
  }
};

/**
 * Get All Lead Statuses
 */
export const getLeadStatusesController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search
      ? String(req.query.search)
      : undefined;

    let isActive: boolean | undefined;

    if (req.query.isActive !== undefined) {
      isActive = String(req.query.isActive) === "true";
    }

    const result = await getLeadStatuses(
      page,
      limit,
      search,
      isActive
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Lead Statuses Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lead statuses",
    });
  }
};

/**
 * Get Lead Status By ID
 */
export const getLeadStatusByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getLeadStatusById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Lead Status By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Lead Status Not Found",
    });
  }
};

/**
 * Update Lead Status
 */
export const updateLeadStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateLeadStatus(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Lead Status Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update lead status",
    });
  }
};

/**
 * Delete Lead Status
 */
export const deleteLeadStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteLeadStatus(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Lead Status Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Lead Status Not Found",
    });
  }
};