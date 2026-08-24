import { Router } from "express";

import {
  createPayrollController,
  getPayrollsController,
  getPayrollByIdController,
  updatePayrollController,
  previewPayrollController,
} from "../controllers/payroll/payroll.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

/* ============================
   CREATE PAYROLL
   ADMIN / HR
============================ */

router.post(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "HR"
  ),
  createPayrollController
);


/* ============================
   PAYROLL PREVIEW
============================ */

router.post(
  "/preview",
  authenticate,
  authorize(
    "ADMIN",
    "HR"
  ),
  previewPayrollController
);

/* ============================
   GET PAYROLLS

   ADMIN / HR
   → all

   TEAM LEADER
   → team only

   EMPLOYEE
   → own only
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
  getPayrollsController
);

/* ============================
   GET PAYROLL BY ID
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
  getPayrollByIdController
);

/* ============================
   UPDATE PAYROLL
   ADMIN / HR
============================ */

router.put(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "HR"
  ),
  updatePayrollController
);

export default router;