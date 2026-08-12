"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payroll_controller_1 = require("../controllers/payroll/payroll.controller");
const router = (0, express_1.Router)();
// Create Payroll
router.post("/", payroll_controller_1.createPayrollController);
// Get All Payrolls
router.get("/", payroll_controller_1.getPayrollsController);
// Get Payroll By ID
router.get("/:id", payroll_controller_1.getPayrollByIdController);
// Update Payroll
router.put("/:id", payroll_controller_1.updatePayrollController);
exports.default = router;
