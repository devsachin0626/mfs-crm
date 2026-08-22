import {
  Request,
  Response,
} from "express";

import * as branchService from "../../services/branch/branch.service";

export const createBranch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await branchService.createBranch(
        req.body
      );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Branch Creation Failed",
    });
  }
};

export const getBranches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await branchService.getBranches();

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed To Load Branches",
    });
  }
};

export const getBranchById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await branchService.getBranchById(
        req.params.id as string
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message:
        error.message ||
        "Branch Not Found",
    });
  }
};

export const updateBranch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await branchService.updateBranch(
        req.params.id as string,
        req.body
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Branch Update Failed",
    });
  }
};