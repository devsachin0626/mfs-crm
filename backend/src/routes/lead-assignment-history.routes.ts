import { Router } from "express";

import {
  createLeadAssignmentHistoryController,
  getLeadAssignmentHistoriesController,
  getLeadAssignmentHistoryByIdController,
  updateLeadAssignmentHistoryController,
  deleteLeadAssignmentHistoryController,
} from "../controllers/lead-assignment-history/lead-assignment-history.controller";

const router = Router();

// Create Lead Assignment History
router.post("/", createLeadAssignmentHistoryController);

// Get All Lead Assignment Histories
router.get("/", getLeadAssignmentHistoriesController);

// Get Lead Assignment History By ID
router.get("/:id", getLeadAssignmentHistoryByIdController);

// Update Lead Assignment History
router.put("/:id", updateLeadAssignmentHistoryController);

// Delete Lead Assignment History
router.delete("/:id", deleteLeadAssignmentHistoryController);

export default router;