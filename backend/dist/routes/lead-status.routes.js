"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_status_controller_1 = require("../controllers/lead-status/lead-status.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/* ============================
   CREATE LEAD STATUS
   Admin / HR / Team Leader
============================ */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), lead_status_controller_1.createLeadStatusController);
/* ============================
   GET ALL LEAD STATUSES
   Employee also needs this
   for filters/dropdowns
============================ */
router.get("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), lead_status_controller_1.getLeadStatusesController);
/* ============================
   GET LEAD STATUS BY ID
============================ */
router.get("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), lead_status_controller_1.getLeadStatusByIdController);
/* ============================
   UPDATE LEAD STATUS
============================ */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), lead_status_controller_1.updateLeadStatusController);
/* ============================
   DELETE LEAD STATUS
============================ */
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), lead_status_controller_1.deleteLeadStatusController);
exports.default = router;
