import { Router } from "express";

import * as roleController from "../controllers/role/role.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  roleController.getRoles
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  roleController.getRoleById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  roleController.createRole
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  roleController.updateRole
);

export default router;