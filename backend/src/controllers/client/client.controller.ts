import { Request, Response } from "express";
import * as clientService from "../../services/client/client.service";

// Create Client
export const createClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await clientService.createClient(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Client Creation Failed",
    });
  }
};

export const getClients = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await clientService.getClients(req.query);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to Fetch Clients",
    });
  }
};

export const getClientById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await clientService.getClientById(req.params.id as string);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Client Not Found",
    });
  }
};

export const updateClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await clientService.updateClient(
      req.params.id as string,
      req.body
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Client Update Failed",
    });
  }
};