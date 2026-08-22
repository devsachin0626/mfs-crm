"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const follow_up_controller_1 = require("../controllers/follow-up/follow-up.controller");
const router = (0, express_1.Router)();
// Create Follow Up
router.post("/", follow_up_controller_1.createFollowUpController);
// Get All Follow Ups
router.get("/", follow_up_controller_1.getFollowUpsController);
// Get Follow Up By ID
router.get("/:id", follow_up_controller_1.getFollowUpByIdController);
// Update Follow Up
router.put("/:id", follow_up_controller_1.updateFollowUpController);
// Delete Follow Up
router.delete("/:id", follow_up_controller_1.deleteFollowUpController);
exports.default = router;
