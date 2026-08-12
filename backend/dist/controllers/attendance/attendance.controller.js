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
exports.monthlyAttendanceReport = exports.updateAttendance = exports.getAttendanceById = exports.getAttendances = exports.checkOut = exports.checkIn = void 0;
const attendanceService = __importStar(require("../../services/attendance/attendance.service"));
/* ============================
   CHECK IN
============================ */
const checkIn = async (req, res) => {
    try {
        const result = await attendanceService.checkIn(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.checkIn = checkIn;
/* ============================
   CHECK OUT
============================ */
const checkOut = async (req, res) => {
    try {
        const result = await attendanceService.checkOut(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.checkOut = checkOut;
/* ============================
   GET ALL ATTENDANCE
============================ */
const getAttendances = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = typeof req.query.search === "string"
            ? req.query.search
            : undefined;
        const status = typeof req.query.status === "string"
            ? req.query.status
            : undefined;
        const month = req.query.month
            ? Number(req.query.month)
            : undefined;
        const year = req.query.year
            ? Number(req.query.year)
            : undefined;
        const result = await attendanceService.getAttendances(page, limit, search, status, month, year);
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message,
            error,
        });
    }
};
exports.getAttendances = getAttendances;
/* ============================
   GET ATTENDANCE BY ID
============================ */
const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await attendanceService.getAttendanceById(id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAttendanceById = getAttendanceById;
/* ============================
   UPDATE ATTENDANCE
============================ */
const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await attendanceService.updateAttendance(id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateAttendance = updateAttendance;
/* ============================
   MONTHLY ATTENDANCE REPORT
============================ */
const monthlyAttendanceReport = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const month = Number(req.query.month);
        const year = Number(req.query.year);
        const result = await attendanceService.monthlyAttendanceReport(employeeId, month, year);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.monthlyAttendanceReport = monthlyAttendanceReport;
