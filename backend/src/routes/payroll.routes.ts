import { Router } from "express";

import {
  createPayrollController,
  getPayrollsController,
  getPayrollByIdController,
  updatePayrollController,
} from "../controllers/payroll/payroll.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  createPayrollController
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  getPayrollsController
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  getPayrollByIdController
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  updatePayrollController
);

export default router;