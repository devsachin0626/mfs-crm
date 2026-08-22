import { Router } from "express";
import * as leaveController from "../controllers/leave/leave.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Apply Leave
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  leaveController.applyLeave
);

// Get All Leaves
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  leaveController.getLeaves
);

// Get Leave By ID
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  leaveController.getLeaveById
);

// Update Leave
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  leaveController.updateLeave
);

// Approve / Reject Leave
router.put(
  "/:id/approve",
  authenticate,
  authorize("ADMIN", "HR"),
  leaveController.approveRejectLeave
);

export default router;