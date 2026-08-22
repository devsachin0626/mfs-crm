import { Router } from "express";

import {
  createLeadHistoryController,
  getLeadHistoriesController,
  getLeadHistoryByIdController,
  updateLeadHistoryController,
  deleteLeadHistoryController,
} from "../controllers/lead-history/lead-history.controller";

const router = Router();

// Create Lead History
router.post("/", createLeadHistoryController);

// Get All Lead Histories
router.get("/", getLeadHistoriesController);

// Get Lead History By ID
router.get("/:id", getLeadHistoryByIdController);

// Update Lead History
router.put("/:id", updateLeadHistoryController);

// Delete Lead History
router.delete("/:id", deleteLeadHistoryController);

export default router;