import { Request, Response } from "express";

import {
  createLeadSource,
  getLeadSources,
  getLeadSourceById,
  updateLeadSource,
  deleteLeadSource,
} from "../../services/lead-source/lead-source.service";

/**
 * Create Lead Source
 */
export const createLeadSourceController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createLeadSource(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Lead Source Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create lead source",
    });
  }
};

/**
 * Get All Lead Sources
 */
export const getLeadSourcesController = async (
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

    const result = await getLeadSources(
      page,
      limit,
      search,
      isActive
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Lead Sources Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lead sources",
    });
  }
};

/**
 * Get Lead Source By ID
 */
export const getLeadSourceByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getLeadSourceById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Lead Source By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Lead Source Not Found",
    });
  }
};

/**
 * Update Lead Source
 */
export const updateLeadSourceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateLeadSource(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Lead Source Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update lead source",
    });
  }
};

/**
 * Delete Lead Source
 */
export const deleteLeadSourceController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteLeadSource(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Lead Source Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Lead Source Not Found",
    });
  }
};

