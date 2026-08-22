import { Router } from "express";

import {
  createLeadSourceController,
  getLeadSourcesController,
  getLeadSourceByIdController,
  updateLeadSourceController,
  deleteLeadSourceController,
} from "../controllers/lead-source/lead-source.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

/* ============================
   CREATE LEAD SOURCE
============================ */

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  createLeadSourceController
);

/* ============================
   GET ALL LEAD SOURCES
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
  getLeadSourcesController
);

/* ============================
   GET LEAD SOURCE BY ID
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
  getLeadSourceByIdController
);

/* ============================
   UPDATE LEAD SOURCE
============================ */

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  updateLeadSourceController
);

/* ============================
   DELETE LEAD SOURCE
============================ */

router.delete(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER"
  ),
  deleteLeadSourceController
);

export default router;