import { Router } from "express";
import * as serviceController from "../controllers/service/service.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/* ============================
   GET ALL SERVICES
============================ */

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  serviceController.getServices
);

/* ============================
   GET SERVICE BY ID
============================ */

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  serviceController.getServiceById
);

/* ============================
   UPDATE SERVICE
============================ */

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  serviceController.updateService
);

export default router;