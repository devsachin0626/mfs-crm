import {
  Response,
} from "express";

import {
  AuthRequest,
} from "../../middleware/auth.middleware";

import * as targetService from "../../services/target/target.service";

/* ============================
   CREATE TARGET
============================ */

export const createTarget =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.employee
      ) {
        res
          .status(401)
          .json({
            success: false,

            message:
              "Authenticated Employee Not Found",
          });

        return;
      }

      const result =
        await targetService.createTarget(
          req.body,
          req.employee
        );

      res
        .status(201)
        .json(
          result
        );
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Target Creation Failed",
        });
    }
  };

/* ============================
   GET TARGETS
============================ */

export const getTargets =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.employee
      ) {
        res
          .status(401)
          .json({
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
        await targetService.getTargets(
          page,
          limit,
          search,
          month,
          year,
          employeeId,
          req.employee
        );

      res
        .status(200)
        .json(
          result
        );
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Failed To Fetch Targets",
        });
    }
  };

/* ============================
   GET TARGET BY ID
============================ */

export const getTargetById =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.employee
      ) {
        res
          .status(401)
          .json({
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
        await targetService.getTargetById(
          id,
          req.employee
        );

      res
        .status(200)
        .json(
          result
        );
    } catch (
      error: any
    ) {
      res
        .status(404)
        .json({
          success: false,

          message:
            error.message ||
            "Target Not Found",
        });
    }
  };

/* ============================
   UPDATE TARGET
============================ */

export const updateTarget =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.employee
      ) {
        res
          .status(401)
          .json({
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
        await targetService.updateTarget(
          id,
          req.body,
          req.employee
        );

      res
        .status(200)
        .json(
          result
        );
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Target Update Failed",
        });
    }
  };