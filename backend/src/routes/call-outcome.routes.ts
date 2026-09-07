import { Router } from "express";

import * as controller from "../controllers/call-outcome/call-outcome.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  controller.list
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  controller.create
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  controller.remove
);

export default router;
