import { Router } from "express";

import * as branchController from "../controllers/branch/branch.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  branchController.getBranches
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  branchController.getBranchById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  branchController.createBranch
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  branchController.updateBranch
);

export default router;