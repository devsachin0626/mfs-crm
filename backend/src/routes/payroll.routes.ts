import { Router } from "express";

import {
  createPayrollController,
  getPayrollsController,
  getPayrollByIdController,
  updatePayrollController,
} from "../controllers/payroll/payroll.controller";

const router = Router();

// Create Payroll
router.post("/", createPayrollController);

// Get All Payrolls
router.get("/", getPayrollsController);

// Get Payroll By ID
router.get("/:id", getPayrollByIdController);

// Update Payroll
router.put("/:id", updatePayrollController);

export default router;