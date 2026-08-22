import {
  Response,
} from "express";

import {
  AuthRequest,
} from "../../middleware/auth.middleware";

import * as attendanceService from "../../services/attendance/attendance.service";

/* ============================
   CHECK IN
============================ */

export const checkIn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const result =
      await attendanceService.checkIn({
        employeeId:
          req.employee.id,

        remarks:
          req.body?.remarks,
      });

    res.status(201).json(
      result
    );
  } catch (error: any) {
    res.status(400).json({
      success: false,

      message:
        error.message ||
        "Check In Failed",
    });
  }
};

/* ============================
   CHECK OUT
============================ */

export const checkOut = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const result =
      await attendanceService.checkOut({
        employeeId:
          req.employee.id,

        remarks:
          req.body?.remarks,
      });

    res.status(200).json(
      result
    );
  } catch (error: any) {
    res.status(400).json({
      success: false,

      message:
        error.message ||
        "Check Out Failed",
    });
  }
};

/* ============================
   GET ATTENDANCES
============================ */

export const getAttendances = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const page =
      Number(
        req.query.page
      ) || 1;

    const limit =
      Number(
        req.query.limit
      ) || 10;

    const search =
      typeof req.query
        .search ===
      "string"
        ? req.query.search
        : undefined;

    const status =
      typeof req.query
        .status ===
      "string"
        ? req.query.status
        : undefined;

    const month =
      req.query.month
        ? Number(
            req.query.month
          )
        : undefined;

    const year =
      req.query.year
        ? Number(
            req.query.year
          )
        : undefined;

    const employeeId =
      typeof req.query
        .employeeId ===
      "string"
        ? req.query
            .employeeId
        : undefined;

    const result =
      await attendanceService.getAttendances(
        page,
        limit,
        search,
        status,
        month,
        year,
        employeeId,
        req.employee
      );

    res.status(200).json(
      result
    );
  } catch (error: any) {
    console.error(
      "Attendance List Error:",
      error
    );

    res.status(400).json({
      success: false,

      message:
        error.message ||
        "Failed to Fetch Attendance",
    });
  }
};

/* ============================
   GET ATTENDANCE BY ID
============================ */

export const getAttendanceById =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const id =
        req.params
          .id as string;

      const result =
        await attendanceService.getAttendanceById(
          id,
          req.employee
        );

      res.status(200).json(
        result
      );
    } catch (error: any) {
      res.status(404).json({
        success: false,

        message:
          error.message ||
          "Attendance Not Found",
      });
    }
  };

/* ============================
   UPDATE ATTENDANCE
============================ */

export const updateAttendance =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const id =
        req.params
          .id as string;

      const result =
        await attendanceService.updateAttendance(
          id,
          req.body
        );

      res.status(200).json(
        result
      );
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Attendance Update Failed",
      });
    }
  };

/* ============================
   MONTHLY ATTENDANCE REPORT
============================ */

export const monthlyAttendanceReport =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const employeeId =
        req.params
          .employeeId as string;

      const month =
        Number(
          req.query.month
        );

      const year =
        Number(
          req.query.year
        );

      if (
        !month ||
        !year
      ) {
        res.status(400).json({
          success: false,
          message:
            "Month and Year are required",
        });

        return;
      }

      const result =
        await attendanceService.monthlyAttendanceReport(
          employeeId,
          month,
          year,
          req.employee
        );

      res.status(200).json(
        result
      );
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Attendance Report Failed",
      });
    }
  };