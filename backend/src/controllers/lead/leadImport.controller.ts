import type {
  Request,
  Response,
} from "express";

import * as leadImportService from "../../services/lead/leadImport.service";

/* ============================
   PREVIEW
============================ */

export const previewLeadImport =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result =
        await leadImportService.previewLeadImport(
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
            error.message,
        });
    }
  };

/* ============================
   IMPORT
============================ */

export const importLeads =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const importedById =
        (req as any)
          .user?.id ||
        (req as any)
          .employee?.id;

      if (!importedById) {
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
        await leadImportService.importLeads(
          req.body,
          importedById
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
            error.message,
        });
    }
  };

/* ============================
   BATCHES
============================ */

export const getImportBatches =
  async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result =
        await leadImportService.getImportBatches();

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };