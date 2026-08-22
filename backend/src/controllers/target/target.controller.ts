import { Request, Response } from "express";
import * as targetService from "../../services/target/target.service";

/* ============================
   CREATE TARGET
============================ */

export const createTarget = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await targetService.createTarget(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   GET ALL TARGETS
============================ */

export const getTargets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const employeeId =
  typeof req.query.employeeId === "string"
    ? req.query.employeeId
    : undefined;

    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const month = req.query.month
      ? Number(req.query.month)
      : undefined;

    const year = req.query.year
      ? Number(req.query.year)
      : undefined;

    const result = await targetService.getTargets(
      page,
      limit,
      search,
      month,
      year,
      employeeId,
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
   GET TARGET BY ID
============================ */

export const getTargetById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await targetService.getTargetById(id as string);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   UPDATE TARGET
============================ */

export const updateTarget = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await targetService.updateTarget(
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