import { Router } from "express";

import {
  createLeadSourceController,
  getLeadSourcesController,
  getLeadSourceByIdController,
  updateLeadSourceController,
  deleteLeadSourceController,
} from "../controllers/lead-source/lead-source.controller";

const router = Router();

// Create Lead Source
router.post("/", createLeadSourceController);

// Get All Lead Sources
router.get("/", getLeadSourcesController);

// Get Lead Source By ID
router.get("/:id", getLeadSourceByIdController);

// Update Lead Source
router.put("/:id", updateLeadSourceController);

// Delete Lead Source
router.delete("/:id", deleteLeadSourceController);

export default router;