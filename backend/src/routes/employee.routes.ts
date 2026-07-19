import { Router } from "express";
import * as employeeController from "../controllers/employee/employee.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { upload } from "../middleware/upload.middleware";


const router = Router();

/**
 * Employee Routes
 */

// Get All Employees
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.getEmployees
);

// Get Employee By Id
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.getEmployeeById
);

// Create Employee
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.createEmployee
);

// Update Employee
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.updateEmployee
);

// Deactivate Employee
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.deactivateEmployee
);


// Restore Employee
router.patch(
  "/:id/restore",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.restoreEmployee
);
// Upload Profile Image
router.patch(
  "/profile-image",
  authenticate,
  upload.single("profileImage"),
  employeeController.uploadProfileImage
);

router.patch(
  "/:id/reset-password",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.resetEmployeePassword
);

export default router;