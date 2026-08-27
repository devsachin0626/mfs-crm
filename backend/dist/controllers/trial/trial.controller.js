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
exports.completeTrial = exports.extendTrial = exports.getTrialById = exports.getTrials = exports.startTrial = void 0;
const trialService = __importStar(require("../../services/trial/trial.service"));
/* ============================
   CURRENT EMPLOYEE
============================ */
const getCurrentEmployee = (req) => {
    const employee = req.employee;
    if (!employee) {
        return null;
    }
    return employee;
};
/* ============================
   START TRIAL
============================ */
const startTrial = async (req, res) => {
    try {
        const currentEmployee = getCurrentEmployee(req);
        if (!currentEmployee) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const result = await trialService.startTrial(req.body, currentEmployee);
        res
            .status(201)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Trial Start Failed",
        });
    }
};
exports.startTrial = startTrial;
/* ============================
   GET TRIALS
============================ */
const getTrials = async (req, res) => {
    try {
        const currentEmployee = getCurrentEmployee(req);
        if (!currentEmployee) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const status = typeof req.query
            .status ===
            "string"
            ? req.query.status
            : undefined;
        const search = typeof req.query
            .search ===
            "string"
            ? req.query.search
            : undefined;
        const employeeId = typeof req.query
            .employeeId ===
            "string"
            ? req.query
                .employeeId
            : undefined;
        const result = await trialService.getTrials(page, limit, status, search, employeeId, currentEmployee);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message ||
                "Failed To Fetch Trials",
        });
    }
};
exports.getTrials = getTrials;
/* ============================
   GET TRIAL BY ID
============================ */
const getTrialById = async (req, res) => {
    try {
        const currentEmployee = getCurrentEmployee(req);
        if (!currentEmployee) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const id = req.params.id;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Trial ID Is Required",
            });
            return;
        }
        const result = await trialService.getTrialById(id, currentEmployee);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        const message = error.message ||
            "Failed To Fetch Trial";
        if (message ===
            "Trial Not Found") {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }
        if (message ===
            "Trial Access Denied") {
            res.status(403).json({
                success: false,
                message,
            });
            return;
        }
        res.status(400).json({
            success: false,
            message,
        });
    }
};
exports.getTrialById = getTrialById;
/* ============================
   EXTEND TRIAL
============================ */
const extendTrial = async (req, res) => {
    try {
        const currentEmployee = getCurrentEmployee(req);
        if (!currentEmployee) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const id = req.params.id;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Trial ID Is Required",
            });
            return;
        }
        const trialDays = Number(req.body.trialDays);
        const remarks = typeof req.body
            .remarks ===
            "string"
            ? req.body.remarks
            : undefined;
        const result = await trialService.extendTrial(id, trialDays, remarks, currentEmployee);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        const message = error.message ||
            "Trial Extension Failed";
        if (message ===
            "Trial Access Denied" ||
            message ===
                "Trial Management Access Denied") {
            res.status(403).json({
                success: false,
                message,
            });
            return;
        }
        if (message ===
            "Trial Not Found") {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }
        res.status(400).json({
            success: false,
            message,
        });
    }
};
exports.extendTrial = extendTrial;
/* ============================
   COMPLETE TRIAL
============================ */
const completeTrial = async (req, res) => {
    try {
        const currentEmployee = getCurrentEmployee(req);
        if (!currentEmployee) {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }
        const id = req.params.id;
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Trial ID Is Required",
            });
            return;
        }
        const result = await trialService.completeTrial(id, currentEmployee);
        res
            .status(200)
            .json(result);
    }
    catch (error) {
        const message = error.message ||
            "Trial Completion Failed";
        if (message ===
            "Trial Access Denied" ||
            message ===
                "Trial Management Access Denied") {
            res.status(403).json({
                success: false,
                message,
            });
            return;
        }
        if (message ===
            "Trial Not Found") {
            res.status(404).json({
                success: false,
                message,
            });
            return;
        }
        res.status(400).json({
            success: false,
            message,
        });
    }
};
exports.completeTrial = completeTrial;
