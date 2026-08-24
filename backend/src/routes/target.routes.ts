import { Router } from "express";

import * as targetController from "../controllers/target/target.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  targetController.createTarget
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  targetController.getTargets
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  targetController.getTargetById
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  targetController.updateTarget
);

export default router;
