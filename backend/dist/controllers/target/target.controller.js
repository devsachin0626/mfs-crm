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
exports.updateTarget = exports.getTargetById = exports.getTargets = exports.createTarget = void 0;
const targetService = __importStar(require("../../services/target/target.service"));
/* ============================
   CREATE TARGET
============================ */
const createTarget = async (req, res) => {
    try {
        const result = await targetService.createTarget(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createTarget = createTarget;
/* ============================
   GET ALL TARGETS
============================ */
const getTargets = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const employeeId = typeof req.query.employeeId === "string"
            ? req.query.employeeId
            : undefined;
        const search = typeof req.query.search === "string"
            ? req.query.search
            : undefined;
        const month = req.query.month
            ? Number(req.query.month)
            : undefined;
        const year = req.query.year
            ? Number(req.query.year)
            : undefined;
        const result = await targetService.getTargets(page, limit, search, month, year, employeeId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getTargets = getTargets;
/* ============================
   GET TARGET BY ID
============================ */
const getTargetById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await targetService.getTargetById(id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getTargetById = getTargetById;
/* ============================
   UPDATE TARGET
============================ */
const updateTarget = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await targetService.updateTarget(id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateTarget = updateTarget;
