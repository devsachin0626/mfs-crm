import { Router } from "express";
import * as clientController from "../controllers/client/client.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Create Client
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  clientController.createClient
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  clientController.getClients
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  clientController.getClientById
);

router.post(
  "/convert/:leadId",
  authenticate,
  authorize(
    "ADMIN",
    "HR",
    "TEAM_LEADER",
    "EMPLOYEE"
  ),
  clientController.convertLeadToClient
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  clientController.updateClient
);

router.post(
  "/convert/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  clientController.convertLeadToClient
);

export default router;