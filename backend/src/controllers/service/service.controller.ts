import { Request, Response } from "express";
import * as serviceService from "../../services/service/service.service";

/* ============================
   GET ALL SERVICES
============================ */

export const getServices = async (
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

    const result = await serviceService.getServices(
      page,
      limit,
      search
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
   GET SERVICE BY ID
============================ */

export const getServiceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await serviceService.getServiceById(id as string);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   UPDATE SERVICE
============================ */

export const updateService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await serviceService.updateService(
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