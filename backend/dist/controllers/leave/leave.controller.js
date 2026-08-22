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
exports.approveRejectLeave = exports.updateLeave = exports.getLeaveById = exports.getLeaves = exports.applyLeave = void 0;
const leaveService = __importStar(require("../../services/leave/leave.service"));
/* ============================
   APPLY LEAVE
============================ */
const applyLeave = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await leaveService.applyLeave({
            ...req.body,
            // Always token employee
            employeeId: req.employee.id,
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Leave Apply Failed",
        });
    }
};
exports.applyLeave = applyLeave;
/* ============================
   GET LEAVES
============================ */
const getLeaves = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = typeof req.query
            .search === "string"
            ? req.query.search
            : undefined;
        const status = typeof req.query
            .status === "string"
            ? req.query.status
            : undefined;
        const employeeId = typeof req.query
            .employeeId === "string"
            ? req.query.employeeId
            : undefined;
        const result = await leaveService.getLeaves(page, limit, search, status, employeeId, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Failed to Fetch Leaves",
        });
    }
};
exports.getLeaves = getLeaves;
/* ============================
   GET LEAVE BY ID
============================ */
const getLeaveById = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = req.params.id;
        const result = await leaveService.getLeaveById(id, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message ||
                "Leave Not Found",
        });
    }
};
exports.getLeaveById = getLeaveById;
/* ============================
   UPDATE LEAVE
============================ */
const updateLeave = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = req.params.id;
        const result = await leaveService.updateLeave(id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Leave Update Failed",
        });
    }
};
exports.updateLeave = updateLeave;
/* ============================
   APPROVE / REJECT LEAVE
============================ */
const approveRejectLeave = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = req.params.id;
        const { status, } = req.body;
        if (status !==
            "APPROVED" &&
            status !==
                "REJECTED") {
            res.status(400).json({
                success: false,
                message: "Status must be APPROVED or REJECTED",
            });
            return;
        }
        const result = await leaveService.approveRejectLeave(id, status, 
        // Approver always comes
        // from authenticated token
        req.employee.id, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Leave Approval Failed",
        });
    }
};
exports.approveRejectLeave = approveRejectLeave;
