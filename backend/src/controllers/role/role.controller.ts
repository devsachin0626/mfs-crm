import {
  Request,
  Response,
} from "express";

import * as roleService from "../../services/role/role.service";

export const createRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await roleService.createRole(
        req.body
      );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Role Creation Failed",
    });
  }
};

export const getRoles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await roleService.getRoles();

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed To Load Roles",
    });
  }
};

export const getRoleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await roleService.getRoleById(
        req.params.id as string
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message:
        error.message ||
        "Role Not Found",
    });
  }
};

export const updateRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await roleService.updateRole(
        req.params.id as string,
        req.body
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Role Update Failed",
    });
  }
};