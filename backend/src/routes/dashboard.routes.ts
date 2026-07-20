import { Router } from "express";
import * as dashboardController from "../controllers/dashboard/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  dashboardController.getDashboardStats
);

export default router;