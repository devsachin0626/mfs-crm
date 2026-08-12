"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_status_controller_1 = require("../controllers/lead-status/lead-status.controller");
const router = (0, express_1.Router)();
// Create Lead Status
router.post("/", lead_status_controller_1.createLeadStatusController);
// Get All Lead Statuses
router.get("/", lead_status_controller_1.getLeadStatusesController);
// Get Lead Status By ID
router.get("/:id", lead_status_controller_1.getLeadStatusByIdController);
// Update Lead Status
router.put("/:id", lead_status_controller_1.updateLeadStatusController);
// Delete Lead Status
router.delete("/:id", lead_status_controller_1.deleteLeadStatusController);
exports.default = router;
