import {
  Router,
} from "express";

import * as trialController from "../controllers/trial/trial.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router =
  Router();

/* ============================
   START TRIAL

   ADMIN / HR
   -> any allowed employee

   TEAM LEADER
   -> self / own team

   EMPLOYEE
   -> self only
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
  trialController.startTrial
);

/* ============================
   LIST TRIALS

   ADMIN / HR
   -> all

   TEAM LEADER
   -> self + own team

   EMPLOYEE
   -> own
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
  trialController.getTrials
);

/* ============================
   TRIAL DETAILS
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
  trialController.getTrialById
);

/* ============================
   EXTEND TRIAL

   management action
============================ */

router.patch(
  "/:id/extend",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  trialController.extendTrial
);

/* ============================
   COMPLETE TRIAL

   management action
============================ */

router.patch(
  "/:id/complete",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  trialController.completeTrial
);

export default router;