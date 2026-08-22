import { Router } from "express";
import * as paymentController from "../controllers/payment/payment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  paymentController.createPayment
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  paymentController.getPayments
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR", "TEAM_LEADER"),
  paymentController.getPaymentById
);

router.patch(
  "/verify/:id",
  authenticate,
  authorize("ADMIN"),
  paymentController.verifyPayment
);

export default router;