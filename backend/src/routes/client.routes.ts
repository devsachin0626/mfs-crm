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

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  clientController.updateClient
);

export default router;