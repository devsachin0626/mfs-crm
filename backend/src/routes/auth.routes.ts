import { Router } from "express";
import * as authController from "../controllers/auth/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";


const router = Router();

/**
 * Authentication
 */

// Login
router.post("/login", authController.login);

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

export default router;