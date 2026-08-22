import { Router } from "express";

import * as leaveController from "../controllers/leave/leave.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

/* ============================
   APPLY LEAVE
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
  leaveController.applyLeave
);

/* ============================
   GET LEAVES

   EMPLOYEE     → own
   TEAM_LEADER  → own + team
   ADMIN / HR   → all
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
  leaveController.getLeaves
);

/* ============================
   GET LEAVE BY ID
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
  leaveController.getLeaveById
);

/* ============================
   UPDATE LEAVE

   ADMIN / HR only
============================ */

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR"
  ),
  leaveController.updateLeave
);

/* ============================
   APPROVE / REJECT

   ADMIN / HR / TEAM LEADER
============================ */

router.put(
  "/:id/approve",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  leaveController.approveRejectLeave
);

export default router;