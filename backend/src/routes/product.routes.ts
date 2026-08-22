import { Router } from "express";
import * as productController from "../controllers/product/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();



router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  productController.getProducts
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"),
  productController.getProductById
);

// Create Product
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  productController.createProduct
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  productController.updateProduct
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "HR"),
  productController.toggleProductStatus
);

export default router;