"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_source_controller_1 = require("../controllers/lead-source/lead-source.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/* ============================
   CREATE LEAD SOURCE
============================ */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), lead_source_controller_1.createLeadSourceController);
/* ============================
   GET ALL LEAD SOURCES
============================ */
router.get("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), lead_source_controller_1.getLeadSourcesController);
/* ============================
   GET LEAD SOURCE BY ID
============================ */
router.get("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), lead_source_controller_1.getLeadSourceByIdController);
/* ============================
   UPDATE LEAD SOURCE
============================ */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), lead_source_controller_1.updateLeadSourceController);
/* ============================
   DELETE LEAD SOURCE
============================ */
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), lead_source_controller_1.deleteLeadSourceController);
exports.default = router;
