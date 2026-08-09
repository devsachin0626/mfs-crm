import { Request, Response } from "express";

import {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} from "../../services/holiday/holiday.service";

/**
 * Create Holiday
 */
export const createHolidayController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await createHoliday(req.body);

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Holiday Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create holiday",
    });
  }
};

/**
 * Get All Holidays
 */
export const getHolidaysController = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search
      ? String(req.query.search)
      : undefined;

    const result = await getHolidays(
      page,
      limit,
      search
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Holidays Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch holidays",
    });
  }
};

/**
 * Get Holiday By ID
 */
export const getHolidayByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await getHolidayById(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Get Holiday By ID Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Holiday Not Found",
    });
  }
};

/**
 * Update Holiday
 */
export const updateHolidayController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await updateHoliday(
      id as string,
      req.body
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Update Holiday Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update holiday",
    });
  }
};

/**
 * Delete Holiday
 */
export const deleteHolidayController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await deleteHoliday(id as string);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Delete Holiday Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Holiday Not Found",
    });
  }
};