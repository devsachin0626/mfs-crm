import { Router } from "express";
import * as trialController from "../controllers/trial/trial.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  trialController.startTrial
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  trialController.getTrials
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  trialController.getTrialById
);

router.patch(
  "/:id/extend",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  trialController.extendTrial
);

router.patch(
  "/:id/complete",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  trialController.completeTrial
);
export default router;

