import {
  Response,
} from "express";

import {
  AuthRequest,
} from "../../middleware/auth.middleware";

import * as attendanceService from "../../services/attendance/attendance.service";

/* ============================
   HELPERS
============================ */

const getErrorMessage = (
  error: unknown,
  fallback: string
) => {
  if (
    error instanceof
    Error
  ) {
    return (
      error.message ||
      fallback
    );
  }

  return fallback;
};

const parsePositiveInteger = (
  value: unknown,
  fallback: number
) => {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(
      parsed
    ) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
};

/* ============================
   CHECK IN
============================ */

export const checkIn =
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

      const result =
        await attendanceService.checkIn({
          employeeId:
            req.employee.id,

          remarks:
            typeof req.body
              ?.remarks ===
            "string"
              ? req.body.remarks
              : undefined,
        });

      res.status(201).json(
        result
      );
    } catch (error: unknown) {
      res.status(400).json({
        success: false,

        message:
          getErrorMessage(
            error,
            "Check In Failed"
          ),
      });
    }
  };

/* ============================
   CHECK OUT
============================ */

export const checkOut =
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

      const result =
        await attendanceService.checkOut({
          employeeId:
            req.employee.id,

          remarks:
            typeof req.body
              ?.remarks ===
            "string"
              ? req.body.remarks
              : undefined,
        });

      res.status(200).json(
        result
      );
    } catch (error: unknown) {
      res.status(400).json({
        success: false,

        message:
          getErrorMessage(
            error,
            "Check Out Failed"
          ),
      });
    }
  };

/* ============================
   GET ATTENDANCES

   month/year represent the
   PAYROLL ATTENDANCE CYCLE.

   Example:

   month = 8
   year = 2026

   means:

   26 Jul 2026
      →
   25 Aug 2026
============================ */

export const getAttendances =
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

      /* ============================
         PAGINATION
      ============================ */

      const page =
        parsePositiveInteger(
          req.query.page,
          1
        );

      const requestedLimit =
        parsePositiveInteger(
          req.query.limit,
          20
        );

      /*
       * Safety cap.
       * Prevent huge list requests.
       */

      const limit =
        Math.min(
          requestedLimit,
          100
        );

      /* ============================
         SEARCH
      ============================ */

      const search =
        typeof req.query
          .search ===
          "string" &&
        req.query.search
          .trim()
          ? req.query.search
              .trim()
          : undefined;

      /* ============================
         STATUS
      ============================ */

      const status =
        typeof req.query
          .status ===
          "string" &&
        req.query.status
          .trim()
          ? req.query.status
              .trim()
              .toUpperCase()
          : undefined;

      /* ============================
         EMPLOYEE
      ============================ */

      const employeeId =
        typeof req.query
          .employeeId ===
          "string" &&
        req.query.employeeId
          .trim()
          ? req.query.employeeId
              .trim()
          : undefined;

      /* ============================
         MONTH / YEAR

         Both should be supplied
         together.

         If neither supplied,
         list can work without
         cycle filter.
      ============================ */

      const hasMonth =
        req.query.month !==
        undefined;

      const hasYear =
        req.query.year !==
        undefined;

      if (
        hasMonth !==
        hasYear
      ) {
        res.status(400).json({
          success: false,

          message:
            "Month and Year must be provided together",
        });

        return;
      }

      let month:
        number | undefined;

      let year:
        number | undefined;

      if (
        hasMonth &&
        hasYear
      ) {
        month =
          Number(
            req.query.month
          );

        year =
          Number(
            req.query.year
          );

        if (
          !Number.isInteger(
            month
          ) ||
          month < 1 ||
          month > 12
        ) {
          res.status(400).json({
            success: false,

            message:
              "Month must be between 1 and 12",
          });

          return;
        }

        if (
          !Number.isInteger(
            year
          ) ||
          year < 2000 ||
          year > 2200
        ) {
          res.status(400).json({
            success: false,

            message:
              "Invalid Year",
          });

          return;
        }
      }

      /* ============================
         SERVICE
      ============================ */

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
    } catch (error: unknown) {
      console.error(
        "Attendance List Error:",
        error
      );

      res.status(400).json({
        success: false,

        message:
          getErrorMessage(
            error,
            "Failed to Fetch Attendance"
          ),
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
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        res.status(400).json({
          success: false,

          message:
            "Attendance ID is required",
        });

        return;
      }

      const result =
        await attendanceService.getAttendanceById(
          id,
          req.employee
        );

      res.status(200).json(
        result
      );
    } catch (error: unknown) {
      const message =
        getErrorMessage(
          error,
          "Attendance Not Found"
        );

      const statusCode =
        message ===
        "Attendance Access Denied"
          ? 403
          : message ===
              "Attendance Not Found"
            ? 404
            : 400;

      res.status(
        statusCode
      ).json({
        success: false,

        message,
      });
    }
  };

/* ============================
   UPDATE ATTENDANCE

   Route authorization should
   continue restricting this
   action to ADMIN / HR.
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
        String(
          req.params.id ||
            ""
        ).trim();

      if (!id) {
        res.status(400).json({
          success: false,

          message:
            "Attendance ID is required",
        });

        return;
      }

      const result =
        await attendanceService.updateAttendance(
          id,
          req.body
        );

      res.status(200).json(
        result
      );
    } catch (error: unknown) {
      res.status(400).json({
        success: false,

        message:
          getErrorMessage(
            error,
            "Attendance Update Failed"
          ),
      });
    }
  };

/* ============================
   MONTHLY ATTENDANCE REPORT

   IMPORTANT:

   Requested month/year is the
   payroll month.

   August 2026:
   26 Jul 2026 → 25 Aug 2026
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

      /* ============================
         EMPLOYEE
      ============================ */

      const employeeId =
        String(
          req.params
            .employeeId ||
            ""
        ).trim();

      if (!employeeId) {
        res.status(400).json({
          success: false,

          message:
            "Employee ID is required",
        });

        return;
      }

      /* ============================
         MONTH / YEAR
      ============================ */

      if (
        req.query.month ===
          undefined ||
        req.query.year ===
          undefined
      ) {
        res.status(400).json({
          success: false,

          message:
            "Month and Year are required",
        });

        return;
      }

      const month =
        Number(
          req.query.month
        );

      const year =
        Number(
          req.query.year
        );

      if (
        !Number.isInteger(
          month
        ) ||
        month < 1 ||
        month > 12
      ) {
        res.status(400).json({
          success: false,

          message:
            "Month must be between 1 and 12",
        });

        return;
      }

      if (
        !Number.isInteger(
          year
        ) ||
        year < 2000 ||
        year > 2200
      ) {
        res.status(400).json({
          success: false,

          message:
            "Invalid Year",
        });

        return;
      }

      /* ============================
         REPORT
      ============================ */

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
    } catch (error: unknown) {
      const message =
        getErrorMessage(
          error,
          "Attendance Report Failed"
        );

      const statusCode =
        message ===
        "Attendance Access Denied"
          ? 403
          : message ===
              "Employee Not Found"
            ? 404
            : 400;

      res.status(
        statusCode
      ).json({
        success: false,

        message,
      });
    }
  };