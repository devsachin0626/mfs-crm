import { Router } from "express";

import * as targetController from "../controllers/target/target.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

/* ============================
   CREATE TARGET
   ADMIN / HR
============================ */

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "HR"
  ),
  targetController.createTarget
);

/* ============================
   GET TARGETS

   ADMIN / HR
   -> ALL

   TEAM LEADER
   -> SELF + TEAM

   EMPLOYEE
   -> SELF
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
  targetController.getTargets
);

/* ============================
   GET TARGET BY ID
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
  targetController.getTargetById
);

/* ============================
   UPDATE TARGET
   ADMIN / HR
============================ */

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR"
  ),
  targetController.updateTarget
);

export default router;