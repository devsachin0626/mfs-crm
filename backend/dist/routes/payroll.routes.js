"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payroll_controller_1 = require("../controllers/payroll/payroll.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/* ============================
   CREATE PAYROLL
   ADMIN / HR
============================ */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR"), payroll_controller_1.createPayrollController);
/* ============================
   PAYROLL PREVIEW
============================ */
router.post("/preview", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR"), payroll_controller_1.previewPayrollController);
/* ============================
   GET PAYROLLS

   ADMIN / HR
   → all

   TEAM LEADER
   → team only

   EMPLOYEE
   → own only
============================ */
router.get("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), payroll_controller_1.getPayrollsController);
/* ============================
   GET PAYROLL BY ID
============================ */
router.get("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), payroll_controller_1.getPayrollByIdController);
/* ============================
   UPDATE PAYROLL
   ADMIN / HR
============================ */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR"), payroll_controller_1.updatePayrollController);
/* ============================
   RECALCULATE PAYROLL

   ADMIN / HR
   PENDING ONLY
============================ */
router.put("/:id/recalculate", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR"), payroll_controller_1.recalculatePayrollController);
exports.default = router;
