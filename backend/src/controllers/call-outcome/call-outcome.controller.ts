import type {
  Request,
  Response,
} from "express";

import * as service from "../../services/call-outcome/call-outcome.service";

const fail = (
  res: Response,
  error: any,
  status = 400
) => res.status(status).json({
  success: false,
  message:
    error?.message || "Request failed",
});

export const list = async (
  req: Request,
  res: Response
) => {
  try {
    const includeInactive =
      String(req.query.includeInactive) ===
      "true";
    res.json(
      await service.getCallOutcomes(
        includeInactive
      )
    );
  } catch (error) {
    fail(res, error, 500);
  }
};

export const create = async (
  req: Request,
  res: Response
) => {
  try {
    res.status(201).json(
      await service.createCallOutcome(
        req.body
      )
    );
  } catch (error) {
    fail(res, error);
  }
};

export const update = async (
  req: Request,
  res: Response
) => {
  try {
    res.json(
      await service.updateCallOutcome(
        String(req.params.id),
        req.body
      )
    );
  } catch (error) {
    fail(res, error);
  }
};

export const remove = async (
  req: Request,
  res: Response
) => {
  try {
    res.json(
      await service.deleteCallOutcome(
        String(req.params.id)
      )
    );
  } catch (error) {
    fail(res, error);
  }
};
