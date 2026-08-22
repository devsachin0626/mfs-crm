import { Router } from "express";
import * as orderController from "../controllers/order/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  orderController.createOrder
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  orderController.getOrders
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  orderController.getOrderById
);


router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  orderController.updateOrder
);


router.patch(
  "/cancel/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  orderController.cancelOrder
);


export default router;