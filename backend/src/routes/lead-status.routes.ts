import { Router } from "express";

import {
  createLeadStatusController,
  getLeadStatusesController,
  getLeadStatusByIdController,
  updateLeadStatusController,
  deleteLeadStatusController,
} from "../controllers/lead-status/lead-status.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

/* ============================
   CREATE LEAD STATUS
   Admin / HR / Team Leader
============================ */

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  createLeadStatusController
);

/* ============================
   GET ALL LEAD STATUSES
   Employee also needs this
   for filters/dropdowns
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
  getLeadStatusesController
);

/* ============================
   GET LEAD STATUS BY ID
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
  getLeadStatusByIdController
);

/* ============================
   UPDATE LEAD STATUS
============================ */

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  updateLeadStatusController
);

/* ============================
   DELETE LEAD STATUS
============================ */

router.delete(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  deleteLeadStatusController
);

export default router;