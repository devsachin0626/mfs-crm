"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_assignment_history_controller_1 = require("../controllers/lead-assignment-history/lead-assignment-history.controller");
const router = (0, express_1.Router)();
// Create Lead Assignment History
router.post("/", lead_assignment_history_controller_1.createLeadAssignmentHistoryController);
// Get All Lead Assignment Histories
router.get("/", lead_assignment_history_controller_1.getLeadAssignmentHistoriesController);
// Get Lead Assignment History By ID
router.get("/:id", lead_assignment_history_controller_1.getLeadAssignmentHistoryByIdController);
// Update Lead Assignment History
router.put("/:id", lead_assignment_history_controller_1.updateLeadAssignmentHistoryController);
// Delete Lead Assignment History
router.delete("/:id", lead_assignment_history_controller_1.deleteLeadAssignmentHistoryController);
exports.default = router;
