import { Router } from "express";

import {
  createFollowUpController,
  getFollowUpsController,
  getFollowUpByIdController,
  updateFollowUpController,
  deleteFollowUpController,
} from "../controllers/follow-up/follow-up.controller";

const router = Router();

// Create Follow Up
router.post("/", createFollowUpController);

// Get All Follow Ups
router.get("/", getFollowUpsController);

// Get Follow Up By ID
router.get("/:id", getFollowUpByIdController);

// Update Follow Up
router.put("/:id", updateFollowUpController);

// Delete Follow Up
router.delete("/:id", deleteFollowUpController);

export default router;