import { Router } from "express";

import {
  createLeadStatusController,
  getLeadStatusesController,
  getLeadStatusByIdController,
  updateLeadStatusController,
  deleteLeadStatusController,
} from "../controllers/lead-status/lead-status.controller";

const router = Router();

// Create Lead Status
router.post("/", createLeadStatusController);

// Get All Lead Statuses
router.get("/", getLeadStatusesController);

// Get Lead Status By ID
router.get("/:id", getLeadStatusByIdController);

// Update Lead Status
router.put("/:id", updateLeadStatusController);

// Delete Lead Status
router.delete("/:id", deleteLeadStatusController);

export default router;