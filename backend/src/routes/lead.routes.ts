import { Router } from "express";

import * as leadController from "../controllers/lead/lead.controller";

import * as leadImportController from "../controllers/lead/leadImport.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

/* ============================
   CREATE LEAD
============================ */

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.createLead
);

/* ============================
   GET ALL LEADS
============================ */

router.get(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getLeads
);

/* ============================
   LEAD SUMMARY
============================ */

router.get(
  "/summary",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getLeadSummary
);

/* ============================
   FOLLOW UPS
============================ */

router.get(
  "/follow-ups",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getFollowUps
);

router.patch(
  "/follow-ups/:id/complete",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.completeFollowUp
);



/* ============================
   CALLING SUMMARY
============================ */

router.get(
  "/calling-summary",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getDailyCallingSummary
);


/* ============================
   CALLING QUEUE
============================ */

router.get(
  "/calling-queue",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getCallingQueue
);

/* ============================
   LEAD PIPELINE
============================ */

router.get(
  "/pipeline/view",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getLeadPipeline
);

/* ============================
   LEAD IMPORT
============================ */

router.post(
  "/import/preview",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leadImportController.previewLeadImport
);

router.post(
  "/import",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leadImportController.importLeads
);

router.get(
  "/import/batches",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leadImportController.getImportBatches
);

/* ============================
   BULK OPERATIONS
============================ */

router.patch(
  "/bulk/assign",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leadController.bulkAssignLeads
);

router.patch(
  "/bulk/stage",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leadController.bulkChangeLeadStage
);

router.patch(
  "/bulk/status",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leadController.bulkChangeLeadStatus
);

/* ============================
   LEAD TIMELINE
============================ */

router.get(
  "/:id/timeline",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getLeadTimeline
);

/* ============================
   CHANGE LEAD STAGE
============================ */

router.patch(
  "/:id/stage",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.changeLeadStage
);

/* ============================
   CHANGE LEAD STATUS
============================ */

router.patch(
  "/:id/status",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.changeLeadStatus
);

/* ============================
   CALL OUTCOME
============================ */

router.post(
  "/:id/call-outcome",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.saveCallOutcome
);

/* ============================
   CREATE FOLLOW UP
============================ */

router.post(
  "/:id/follow-up",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.createFollowUp
);

/* ============================
   ASSIGN LEAD
============================ */

router.patch(
  "/:id/assign",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leadController.assignLead
);

/* ============================
   UPDATE LEAD
============================ */

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.updateLead
);

/* ============================
   GET LEAD BY ID
   KEEP THIS NEAR THE END
============================ */

router.get(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  leadController.getLeadById
);

export default router;