import { Router } from "express";
import * as authController from "../controllers/auth/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { rateLimit } from "express-rate-limit";


const router = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT_PER_15_MINUTES || 10),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many failed login attempts. Please try again after 15 minutes.",
  },
});

/**
 * Authentication
 */

// Login
router.post("/login", loginRateLimit, authController.login);

// Current Logged In Employee
router.get("/me", authenticate, authController.me);

// Change Password
router.post(
  "/change-password",
  authenticate,
  authController.changePassword
);

router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin",
    });
  }
);

router.post(
  "/impersonate/:employeeId",
  authenticate,
  authorize("ADMIN"),
  authController.impersonateEmployee
);

router.patch(
  "/reset-employee-password",
  authenticate,
  authorize("ADMIN"),
  authController.resetEmployeePassword
);

export default router;
