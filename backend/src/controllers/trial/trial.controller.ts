import { Request, Response } from "express";
import * as trialService from "../../services/trial/trial.service";

export const startTrial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await trialService.startTrial(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Trial Start Failed",
    });
  }
};

export const getTrials = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await trialService.getTrials(page, limit);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTrialById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await trialService.getTrialById(id);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const extendTrial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const { trialDays } = req.body;

    const result = await trialService.extendTrial(id, trialDays);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeTrial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await trialService.completeTrial(id);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};