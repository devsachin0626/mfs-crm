import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as employeeService from "../../services/employee/employee.service";

// Create Employee
export const createEmployee = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await employeeService.createEmployee(
      req.body,
      req.employee!.id
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Employee Creation Failed",
    });
  }
};

export const getEmployees = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await employeeService.getEmployees((req.query));

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const getEmployeeById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await employeeService.getEmployeeById(id);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }

};

export const updateEmployee = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await employeeService.updateEmployee(
      id,
      req.body,
      req.employee!.id
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Employee Update Failed",
    });
  }
};

export const deactivateEmployee = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await employeeService.deactivateEmployee(
      id,
      req.employee!.id
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to Deactivate Employee",
    });
  }
};

// Restore Employee
export const restoreEmployee = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await employeeService.restoreEmployee(
      id,
      req.employee!.id
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to Restore Employee",
    });
  }
};

export const uploadProfileImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      throw new Error("Please upload an image");
    }

    const result = await employeeService.uploadProfileImage(
      req.employee!.id,
      req.file.filename
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Profile Image Upload Failed",
    });
  }
};

