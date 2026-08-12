"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leadController = __importStar(require("../controllers/lead/lead.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Create Lead
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.createLead);
// Get All Leads
router.get("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.getLeads);
// Get All Follow-ups
router.get("/follow-ups", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getFollowUps);
// Get Lead By ID
router.get("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.getLeadById);
// Update Lead
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.updateLead);
// Assign Lead
router.patch("/:id/assign", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.assignLead);
// Change Lead Status
router.patch("/:id/status", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.changeLeadStatus);
// Create Follow-up
router.post("/:id/follow-up", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.createFollowUp);
// Complete Follow-up
router.patch("/follow-ups/:id/complete", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.completeFollowUp);
exports.default = router;
