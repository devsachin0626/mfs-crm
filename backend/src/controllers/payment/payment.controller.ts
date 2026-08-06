import { Request, Response } from "express";
import * as paymentService from "../../services/payment/payment.service";
import { AuthRequest } from "../../middleware/auth.middleware";


export const createPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await paymentService.createPayment(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPayments = async (
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

    const result = await paymentService.getPayments(
      page,
      limit,
      search
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPaymentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await paymentService.getPaymentById(id as string);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const { remarks } = req.body;

    const result = await paymentService.verifyPayment(
      id as string,
      req.employee.id,
      remarks
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};