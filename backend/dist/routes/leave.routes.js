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
const leaveController = __importStar(require("../controllers/leave/leave.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/* ============================
   APPLY LEAVE
============================ */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leaveController.applyLeave);
/* ============================
   GET LEAVES

   EMPLOYEE     → own
   TEAM_LEADER  → own + team
   ADMIN / HR   → all
============================ */
router.get("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leaveController.getLeaves);
/* ============================
   GET LEAVE BY ID
============================ */
router.get("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER", "EMPLOYEE"), leaveController.getLeaveById);
/* ============================
   UPDATE LEAVE

   ADMIN / HR only
============================ */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR"), leaveController.updateLeave);
/* ============================
   APPROVE / REJECT

   ADMIN / HR / TEAM LEADER
============================ */
router.put("/:id/approve", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)("ADMIN", "HR", "TEAM_LEADER"), leaveController.approveRejectLeave);
exports.default = router;
