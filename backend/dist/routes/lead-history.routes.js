"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_history_controller_1 = require("../controllers/lead-history/lead-history.controller");
const router = (0, express_1.Router)();
// Create Lead History
router.post("/", lead_history_controller_1.createLeadHistoryController);
// Get All Lead Histories
router.get("/", lead_history_controller_1.getLeadHistoriesController);
// Get Lead History By ID
router.get("/:id", lead_history_controller_1.getLeadHistoryByIdController);
// Update Lead History
router.put("/:id", lead_history_controller_1.updateLeadHistoryController);
// Delete Lead History
router.delete("/:id", lead_history_controller_1.deleteLeadHistoryController);
exports.default = router;
