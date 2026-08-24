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
const leadImportController = __importStar(require("../controllers/lead/leadImport.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/* ============================
   CREATE LEAD
============================ */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.createLead);
/* ============================
   GET ALL LEADS
============================ */
router.get("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getLeads);
/* ============================
   FOLLOW UPS
============================ */
router.get("/follow-ups", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getFollowUps);
router.patch("/follow-ups/:id/complete", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.completeFollowUp);
/* ============================
   CALLING SUMMARY
============================ */
router.get("/calling-summary", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getDailyCallingSummary);
/* ============================
   CALLING QUEUE
============================ */
router.get("/calling-queue", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getCallingQueue);
/* ============================
   LEAD PIPELINE
============================ */
router.get("/pipeline/view", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getLeadPipeline);
/* ============================
   LEAD IMPORT
============================ */
router.post("/import/preview", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadImportController.previewLeadImport);
router.post("/import", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadImportController.importLeads);
router.get("/import/batches", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadImportController.getImportBatches);
/* ============================
   BULK OPERATIONS
============================ */
router.patch("/bulk/assign", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.bulkAssignLeads);
router.patch("/bulk/stage", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.bulkChangeLeadStage);
router.patch("/bulk/status", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.bulkChangeLeadStatus);
/* ============================
   LEAD TIMELINE
============================ */
router.get("/:id/timeline", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getLeadTimeline);
/* ============================
   CHANGE LEAD STAGE
============================ */
router.patch("/:id/stage", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.changeLeadStage);
/* ============================
   CHANGE LEAD STATUS
============================ */
router.patch("/:id/status", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.changeLeadStatus);
/* ============================
   CALL OUTCOME
============================ */
router.post("/:id/call-outcome", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.saveCallOutcome);
/* ============================
   CREATE FOLLOW UP
============================ */
router.post("/:id/follow-up", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.createFollowUp);
/* ============================
   ASSIGN LEAD
============================ */
router.patch("/:id/assign", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.assignLead);
/* ============================
   UPDATE LEAD
============================ */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leadController.updateLead);
/* ============================
   GET LEAD BY ID
   KEEP THIS NEAR THE END
============================ */
router.get("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leadController.getLeadById);
exports.default = router;
