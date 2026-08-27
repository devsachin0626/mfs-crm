import {
  Request,
  Response,
} from "express";

import * as trialService from "../../services/trial/trial.service";

import type {
  CurrentEmployee,
} from "../../types/current-employee.types";

/* ============================
   CURRENT EMPLOYEE
============================ */

const getCurrentEmployee = (
  req: Request
): CurrentEmployee | null => {
  const employee =
    (req as any).employee;

  if (!employee) {
    return null;
  }

  return employee as CurrentEmployee;
};

/* ============================
   START TRIAL
============================ */

export const startTrial =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentEmployee =
        getCurrentEmployee(req);

      if (!currentEmployee) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });

        return;
      }

      const result =
        await trialService.startTrial(
          req.body,
          currentEmployee
        );

      res
        .status(201)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Trial Start Failed",
      });
    }
  };

/* ============================
   GET TRIALS
============================ */

export const getTrials =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentEmployee =
        getCurrentEmployee(req);

      if (!currentEmployee) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });

        return;
      }

      const page =
        Math.max(
          Number(
            req.query.page
          ) || 1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 10,
            1
          ),
          100
        );

      const status =
        typeof req.query
          .status ===
        "string"
          ? req.query.status
          : undefined;

      const search =
        typeof req.query
          .search ===
        "string"
          ? req.query.search
          : undefined;

      const employeeId =
        typeof req.query
          .employeeId ===
        "string"
          ? req.query
              .employeeId
          : undefined;

      const result =
        await trialService.getTrials(
          page,
          limit,
          status,
          search,
          employeeId,
          currentEmployee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,

        message:
          error.message ||
          "Failed To Fetch Trials",
      });
    }
  };

/* ============================
   GET TRIAL BY ID
============================ */

export const getTrialById =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentEmployee =
        getCurrentEmployee(req);

      if (!currentEmployee) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });

        return;
      }

      const id =
        req.params.id as string;

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Trial ID Is Required",
        });

        return;
      }

      const result =
        await trialService.getTrialById(
          id,
          currentEmployee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      const message =
        error.message ||
        "Failed To Fetch Trial";

      if (
        message ===
        "Trial Not Found"
      ) {
        res.status(404).json({
          success: false,
          message,
        });

        return;
      }

      if (
        message ===
        "Trial Access Denied"
      ) {
        res.status(403).json({
          success: false,
          message,
        });

        return;
      }

      res.status(400).json({
        success: false,
        message,
      });
    }
  };

/* ============================
   EXTEND TRIAL
============================ */

export const extendTrial =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentEmployee =
        getCurrentEmployee(req);

      if (!currentEmployee) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });

        return;
      }

      const id =
        req.params.id as string;

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Trial ID Is Required",
        });

        return;
      }

      const trialDays =
        Number(
          req.body.trialDays
        );

      const remarks =
        typeof req.body
          .remarks ===
        "string"
          ? req.body.remarks
          : undefined;

      const result =
        await trialService.extendTrial(
          id,
          trialDays,
          remarks,
          currentEmployee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      const message =
        error.message ||
        "Trial Extension Failed";

      if (
        message ===
        "Trial Access Denied" ||
        message ===
          "Trial Management Access Denied"
      ) {
        res.status(403).json({
          success: false,
          message,
        });

        return;
      }

      if (
        message ===
        "Trial Not Found"
      ) {
        res.status(404).json({
          success: false,
          message,
        });

        return;
      }

      res.status(400).json({
        success: false,
        message,
      });
    }
  };

/* ============================
   COMPLETE TRIAL
============================ */

export const completeTrial =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const currentEmployee =
        getCurrentEmployee(req);

      if (!currentEmployee) {
        res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });

        return;
      }

      const id =
        req.params.id as string;

      if (!id) {
        res.status(400).json({
          success: false,
          message:
            "Trial ID Is Required",
        });

        return;
      }

      const result =
        await trialService.completeTrial(
          id,
          currentEmployee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      const message =
        error.message ||
        "Trial Completion Failed";

      if (
        message ===
        "Trial Access Denied" ||
        message ===
          "Trial Management Access Denied"
      ) {
        res.status(403).json({
          success: false,
          message,
        });

        return;
      }

      if (
        message ===
        "Trial Not Found"
      ) {
        res.status(404).json({
          success: false,
          message,
        });

        return;
      }

      res.status(400).json({
        success: false,
        message,
      });
    }
  };