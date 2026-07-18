import { Router } from "express";
import * as employeeController from "../controllers/employee/employee.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";


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
// Restore Employee
router.patch(
  "/:id/restore",
  authenticate,
  authorize("ADMIN", "HR"),
  employeeController.restoreEmployee
);

export default router;