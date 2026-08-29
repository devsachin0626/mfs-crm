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
   HELPERS
============================ */
const getErrorMessage = (error, fallback) => {
    if (error instanceof
        Error) {
        return (error.message ||
            fallback);
    }
    return fallback;
};
const parsePositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) ||
        parsed <= 0) {
        return fallback;
    }
    return parsed;
};
/* ============================
   CHECK IN
============================ */
const checkIn = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await attendanceService.checkIn({
            employeeId: req.employee.id,
            remarks: typeof req.body
                ?.remarks ===
                "string"
                ? req.body.remarks
                : undefined,
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: getErrorMessage(error, "Check In Failed"),
        });
    }
};
exports.checkIn = checkIn;
/* ============================
   CHECK OUT
============================ */
const checkOut = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const result = await attendanceService.checkOut({
            employeeId: req.employee.id,
            remarks: typeof req.body
                ?.remarks ===
                "string"
                ? req.body.remarks
                : undefined,
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: getErrorMessage(error, "Check Out Failed"),
        });
    }
};
exports.checkOut = checkOut;
/* ============================
   GET ATTENDANCES

   month/year represent the
   PAYROLL ATTENDANCE CYCLE.

   Example:

   month = 8
   year = 2026

   means:

   26 Jul 2026
      →
   25 Aug 2026
============================ */
const getAttendances = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        /* ============================
           PAGINATION
        ============================ */
        const page = parsePositiveInteger(req.query.page, 1);
        const requestedLimit = parsePositiveInteger(req.query.limit, 20);
        /*
         * Safety cap.
         * Prevent huge list requests.
         */
        const limit = Math.min(requestedLimit, 100);
        /* ============================
           SEARCH
        ============================ */
        const search = typeof req.query
            .search ===
            "string" &&
            req.query.search
                .trim()
            ? req.query.search
                .trim()
            : undefined;
        /* ============================
           STATUS
        ============================ */
        const status = typeof req.query
            .status ===
            "string" &&
            req.query.status
                .trim()
            ? req.query.status
                .trim()
                .toUpperCase()
            : undefined;
        /* ============================
           EMPLOYEE
        ============================ */
        const employeeId = typeof req.query
            .employeeId ===
            "string" &&
            req.query.employeeId
                .trim()
            ? req.query.employeeId
                .trim()
            : undefined;
        /* ============================
           MONTH / YEAR
  
           Both should be supplied
           together.
  
           If neither supplied,
           list can work without
           cycle filter.
        ============================ */
        const hasMonth = req.query.month !==
            undefined;
        const hasYear = req.query.year !==
            undefined;
        if (hasMonth !==
            hasYear) {
            res.status(400).json({
                success: false,
                message: "Month and Year must be provided together",
            });
            return;
        }
        let month;
        let year;
        if (hasMonth &&
            hasYear) {
            month =
                Number(req.query.month);
            year =
                Number(req.query.year);
            if (!Number.isInteger(month) ||
                month < 1 ||
                month > 12) {
                res.status(400).json({
                    success: false,
                    message: "Month must be between 1 and 12",
                });
                return;
            }
            if (!Number.isInteger(year) ||
                year < 2000 ||
                year > 2200) {
                res.status(400).json({
                    success: false,
                    message: "Invalid Year",
                });
                return;
            }
        }
        /* ============================
           SERVICE
        ============================ */
        const result = await attendanceService.getAttendances(page, limit, search, status, month, year, employeeId, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Attendance List Error:", error);
        res.status(400).json({
            success: false,
            message: getErrorMessage(error, "Failed to Fetch Attendance"),
        });
    }
};
exports.getAttendances = getAttendances;
/* ============================
   GET ATTENDANCE BY ID
============================ */
const getAttendanceById = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = String(req.params.id ||
            "").trim();
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Attendance ID is required",
            });
            return;
        }
        const result = await attendanceService.getAttendanceById(id, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        const message = getErrorMessage(error, "Attendance Not Found");
        const statusCode = message ===
            "Attendance Access Denied"
            ? 403
            : message ===
                "Attendance Not Found"
                ? 404
                : 400;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
exports.getAttendanceById = getAttendanceById;
/* ============================
   UPDATE ATTENDANCE

   Route authorization should
   continue restricting this
   action to ADMIN / HR.
============================ */
const updateAttendance = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        const id = String(req.params.id ||
            "").trim();
        if (!id) {
            res.status(400).json({
                success: false,
                message: "Attendance ID is required",
            });
            return;
        }
        const result = await attendanceService.updateAttendance(id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: getErrorMessage(error, "Attendance Update Failed"),
        });
    }
};
exports.updateAttendance = updateAttendance;
/* ============================
   MONTHLY ATTENDANCE REPORT

   IMPORTANT:

   Requested month/year is the
   payroll month.

   August 2026:
   26 Jul 2026 → 25 Aug 2026
============================ */
const monthlyAttendanceReport = async (req, res) => {
    try {
        if (!req.employee) {
            res.status(401).json({
                success: false,
                message: "Authenticated Employee Not Found",
            });
            return;
        }
        /* ============================
           EMPLOYEE
        ============================ */
        const employeeId = String(req.params
            .employeeId ||
            "").trim();
        if (!employeeId) {
            res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
            return;
        }
        /* ============================
           MONTH / YEAR
        ============================ */
        if (req.query.month ===
            undefined ||
            req.query.year ===
                undefined) {
            res.status(400).json({
                success: false,
                message: "Month and Year are required",
            });
            return;
        }
        const month = Number(req.query.month);
        const year = Number(req.query.year);
        if (!Number.isInteger(month) ||
            month < 1 ||
            month > 12) {
            res.status(400).json({
                success: false,
                message: "Month must be between 1 and 12",
            });
            return;
        }
        if (!Number.isInteger(year) ||
            year < 2000 ||
            year > 2200) {
            res.status(400).json({
                success: false,
                message: "Invalid Year",
            });
            return;
        }
        /* ============================
           REPORT
        ============================ */
        const result = await attendanceService.monthlyAttendanceReport(employeeId, month, year, req.employee);
        res.status(200).json(result);
    }
    catch (error) {
        const message = getErrorMessage(error, "Attendance Report Failed");
        const statusCode = message ===
            "Attendance Access Denied"
            ? 403
            : message ===
                "Employee Not Found"
                ? 404
                : 400;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
exports.monthlyAttendanceReport = monthlyAttendanceReport;
