import { Request, Response } from "express";

import {
  createImportBatch,
  getImportBatches,
  getImportBatchById,
  updateImportBatch,
  deleteImportBatch,
} from "../../services/import-batch/import-batch.service";

/**
 * Create Import Batch
 */
export const createImportBatchController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createImportBatch(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Import Batch Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create import batch",
    });
  }
};

/**
 * Get All Import Batches
 */
export const getImportBatchesController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search
      ? String(req.query.search)
      : undefined;

    const result = await getImportBatches(
      page,
      limit,
      search
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Import Batches Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch import batches",
    });
  }
};

/**
 * Get Import Batch By ID
 */
export const getImportBatchByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getImportBatchById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Import Batch By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Import Batch Not Found",
    });
  }
};

/**
 * Update Import Batch
 */
export const updateImportBatchController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateImportBatch(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Import Batch Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update import batch",
    });
  }
};

/**
 * Delete Import Batch
 */
export const deleteImportBatchController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteImportBatch(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Import Batch Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Import Batch Not Found",
    });
  }
};