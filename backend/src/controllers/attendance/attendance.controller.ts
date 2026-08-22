import { Request, Response } from "express";
import * as attendanceService from "../../services/attendance/attendance.service";

/* ============================
   CHECK IN
============================ */

export const checkIn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await attendanceService.checkIn(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   CHECK OUT
============================ */

export const checkOut = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await attendanceService.checkOut(req.body);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   GET ALL ATTENDANCE
============================ */

export const getAttendances = async (
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

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const month = req.query.month
      ? Number(req.query.month)
      : undefined;

    const year = req.query.year
      ? Number(req.query.year)
      : undefined;

    const result = await attendanceService.getAttendances(
      page,
      limit,
      search,
      status,
      month,
      year
    );

    res.status(200).json(result);
  } catch (error: any) {
  console.error(error);

  res.status(400).json({
    success: false,
    message: error.message,
    error,
  });
}
};

/* ============================
   GET ATTENDANCE BY ID
============================ */

export const getAttendanceById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result =
      await attendanceService.getAttendanceById(id as string);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/* ============================
   UPDATE ATTENDANCE
============================ */

export const updateAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result =
      await attendanceService.updateAttendance(
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

/* ============================
   MONTHLY ATTENDANCE REPORT
============================ */

export const monthlyAttendanceReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;

    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const result =
      await attendanceService.monthlyAttendanceReport(
        employeeId as string,
        month,
        year
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};