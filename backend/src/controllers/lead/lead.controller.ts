import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as leadService from "../../services/lead/lead.service";

// Create Lead
export const createLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await leadService.createLead(
      req.body,
      req.employee!.id
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lead Creation Failed",
    });
  }
};

// Get All Leads
export const getLeads = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await leadService.getLeads(req.query);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to Fetch Leads",
    });
  }
};

// Get Lead By ID
export const getLeadById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await leadService.getLeadById(req.params.id as string);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Lead Not Found",
    });
  }
};

// Update Lead
export const updateLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await leadService.updateLead(id, req.body);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lead Update Failed",
    });
  }
};

// Assign Lead
export const assignLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const leadId = req.params.id as string;

    const result = await leadService.assignLead(
      leadId,
      req.body
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lead Assignment Failed",
    });
  }
};

// Change Lead Status
export const changeLeadStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const leadId = req.params.id as string;

    const result = await leadService.changeLeadStatus(
      leadId,
      req.employee!.id,
      req.body
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lead Status Update Failed",
    });
  }
};

// Create Follow-up
export const createFollowUp = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const leadId = req.params.id as string;

    const result = await leadService.createFollowUp(
      leadId,
      req.employee!.id,
      req.body
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Follow-up Creation Failed",
    });
  }
};

// Get All Follow-ups
export const getFollowUps = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await leadService.getFollowUps(req.query);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to Fetch Follow-ups",
    });
  }
};

export const completeFollowUp = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await leadService.completeFollowUp(
      req.params.id as string
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};