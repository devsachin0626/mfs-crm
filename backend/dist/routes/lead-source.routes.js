"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lead_source_controller_1 = require("../controllers/lead-source/lead-source.controller");
const router = (0, express_1.Router)();
// Create Lead Source
router.post("/", lead_source_controller_1.createLeadSourceController);
// Get All Lead Sources
router.get("/", lead_source_controller_1.getLeadSourcesController);
// Get Lead Source By ID
router.get("/:id", lead_source_controller_1.getLeadSourceByIdController);
// Update Lead Source
router.put("/:id", lead_source_controller_1.updateLeadSourceController);
// Delete Lead Source
router.delete("/:id", lead_source_controller_1.deleteLeadSourceController);
exports.default = router;
