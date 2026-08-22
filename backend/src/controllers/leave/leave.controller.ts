import {
  Response,
} from "express";

import {
  AuthRequest,
} from "../../middleware/auth.middleware";

import * as leaveService from "../../services/leave/leave.service";

/* ============================
   APPLY LEAVE
============================ */

export const applyLeave = async (
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
      await leaveService.applyLeave({
        ...req.body,

        // Always token employee
        employeeId:
          req.employee.id,
      });

    res.status(201).json(
      result
    );
  } catch (error: any) {
    res.status(400).json({
      success: false,

      message:
        error.message ||
        "Leave Apply Failed",
    });
  }
};

/* ============================
   GET LEAVES
============================ */

export const getLeaves = async (
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
        .search === "string"
        ? req.query.search
        : undefined;

    const status =
      typeof req.query
        .status === "string"
        ? req.query.status
        : undefined;

    const employeeId =
      typeof req.query
        .employeeId === "string"
        ? req.query.employeeId
        : undefined;

    const result =
      await leaveService.getLeaves(
        page,
        limit,
        search,
        status,
        employeeId,
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
        "Failed to Fetch Leaves",
    });
  }
};

/* ============================
   GET LEAVE BY ID
============================ */

export const getLeaveById =
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
        req.params.id as string;

      const result =
        await leaveService.getLeaveById(
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
          "Leave Not Found",
      });
    }
  };

/* ============================
   UPDATE LEAVE
============================ */

export const updateLeave =
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
        req.params.id as string;

      const result =
        await leaveService.updateLeave(
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
          "Leave Update Failed",
      });
    }
  };

/* ============================
   APPROVE / REJECT LEAVE
============================ */

export const approveRejectLeave =
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
        req.params.id as string;

      const {
        status,
      } = req.body;

      if (
        status !==
          "APPROVED" &&
        status !==
          "REJECTED"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Status must be APPROVED or REJECTED",
        });

        return;
      }

      const result =
        await leaveService.approveRejectLeave(
          id,
          status,

          // Approver always comes
          // from authenticated token
          req.employee.id,

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
          "Leave Approval Failed",
      });
    }
  };