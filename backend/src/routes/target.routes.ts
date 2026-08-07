import { Router } from "express";
import * as targetController from "../controllers/target/target.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* ============================
   CREATE TARGET
============================ */

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  targetController.createTarget
);

/* ============================
   GET ALL TARGETS
============================ */

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  targetController.getTargets
);

/* ============================
   GET TARGET BY ID
============================ */

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  targetController.getTargetById
);

/* ============================
   UPDATE TARGET
============================ */

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  targetController.updateTarget
);

export default router;