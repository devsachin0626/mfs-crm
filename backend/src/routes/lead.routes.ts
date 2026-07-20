import { Router } from "express";
import * as leadController from "../controllers/lead/lead.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Create Lead
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  leadController.createLead
);

// Get All Leads
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  leadController.getLeads
);

// Get All Follow-ups
router.get(
  "/follow-ups",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  leadController.getFollowUps
);

// Get Lead By ID
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  leadController.getLeadById
);

// Update Lead
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  leadController.updateLead
);

// Assign Lead
router.patch(
  "/:id/assign",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  leadController.assignLead
);

// Change Lead Status
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  leadController.changeLeadStatus
);

// Create Follow-up
router.post(
  "/:id/follow-up",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  leadController.createFollowUp
);

// Complete Follow-up
router.patch(
  "/follow-ups/:id/complete",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  leadController.completeFollowUp
);

export default router;