import {
  Request,
  Response,
} from "express";

import * as clientService from "../../services/client/client.service";

/* ============================
   CREATE CLIENT
============================ */

export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await clientService.createClient(
        req.body
      );

    res
      .status(201)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message ||
          "Client Creation Failed",
      });
  }
};

/* ============================
   GET CLIENTS
============================ */

export const getClients = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await clientService.getClients(
        req.query
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message:
          error.message ||
          "Failed to Fetch Clients",
      });
  }
};

/* ============================
   GET CLIENT BY ID
============================ */

export const getClientById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await clientService.getClientById(
        req.params.id as string
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(404)
      .json({
        success: false,
        message:
          error.message ||
          "Client Not Found",
      });
  }
};

/* ============================
   UPDATE CLIENT
============================ */

export const updateClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result =
      await clientService.updateClient(
        req.params.id as string,
        req.body
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message ||
          "Client Update Failed",
      });
  }
};

/* ============================
   CONVERT LEAD TO CLIENT
============================ */

export const convertLeadToClient =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { leadId } =
        req.params;

      const employeeId =
        (req as any)
          .user?.id ||
        (req as any)
          .employee?.id;

      if (!employeeId) {
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
        await clientService.convertLeadToClient(
          leadId as string,
          employeeId,
          req.body
        );

      res
        .status(201)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message ||
            "Lead Conversion Failed",
        });
    }
  };