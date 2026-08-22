"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyAttendanceReport = exports.updateAttendance = exports.getAttendanceById = exports.getAttendances = exports.checkOut = exports.checkIn = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
/* ============================
   CHECK IN
============================ */
const checkIn = async (data) => {
    // Employee Check
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Today's Date (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Tomorrow (00:00:00)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // Duplicate Check
    const existingAttendance = await prisma_1.default.attendance.findFirst({
        where: {
            employeeId: data.employeeId,
            attendanceDate: {
                gte: today,
                lt: tomorrow,
            },
        },
    });
    if (existingAttendance) {
        throw new Error("Employee Already Checked In Today");
    }
    // Current Time
    const now = new Date();
    // Late Time (09:15 AM)
    const lateTime = new Date();
    lateTime.setHours(9, 15, 0, 0);
    let status = client_1.AttendanceStatus.PRESENT;
    if (now > lateTime) {
        status = client_1.AttendanceStatus.LATE;
    }
    // Create Attendance
    const attendance = await prisma_1.default.attendance.create({
        data: {
            employee: {
                connect: {
                    id: data.employeeId,
                },
            },
            attendanceDate: today,
            checkIn: now,
            status,
            remarks: data.remarks,
        },
        include: {
            employee: true,
        },
    });
    return {
        success: true,
        message: "Check In Successful",
        attendance,
    };
};
exports.checkIn = checkIn;
/* ============================
   CHECK OUT
============================ */
const checkOut = async (data) => {
    // Employee Check
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    // Today's Date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    // Attendance Check
    const attendance = await prisma_1.default.attendance.findFirst({
        where: {
            employeeId: data.employeeId,
            attendanceDate: {
                gte: today,
                lt: tomorrow,
            },
        },
    });
    if (!attendance) {
        throw new Error("Please Check-In First");
    }
    // Already Checked Out
    if (attendance.checkOut) {
        throw new Error("Employee Already Checked Out");
    }
    const now = new Date();
    // Working Hours
    const milliseconds = now.getTime() - attendance.checkIn.getTime();
    const workingHours = Number((milliseconds / (1000 * 60 * 60)).toFixed(2));
    // Default Status
    let status = attendance.status;
    // Half Day Rule
    if (workingHours < 4) {
        status = "HALF_DAY";
    }
    const updatedAttendance = await prisma_1.default.attendance.update({
        where: {
            id: attendance.id,
        },
        data: {
            checkOut: now,
            workingHours: new client_1.Prisma.Decimal(workingHours),
            status,
            remarks: data.remarks ?? attendance.remarks,
        },
        include: {
            employee: true,
        },
    });
    return {
        success: true,
        message: "Check Out Successful",
        attendance: updatedAttendance,
    };
};
exports.checkOut = checkOut;
/* ============================
   GET ALL ATTENDANCE
============================ */
const getAttendances = async (page, limit, search, status, month, year) => {
    const skip = (page - 1) * limit;
    const where = {};
    // Search by Employee Name
    if (search) {
        where.employee = {
            name: {
                contains: search,
                mode: "insensitive",
            },
        };
    }
    // Filter by Status
    if (status) {
        where.status = status;
    }
    // Filter by Month & Year
    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        where.attendanceDate = {
            gte: startDate,
            lt: endDate,
        };
    }
    const total = await prisma_1.default.attendance.count({
        where,
    });
    const attendances = await prisma_1.default.attendance.findMany({
        where,
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    email: true,
                    mobile: true,
                },
            },
        },
        orderBy: {
            attendanceDate: "desc",
        },
        skip,
        take: limit,
    });
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        attendances,
    };
};
exports.getAttendances = getAttendances;
/* ============================
   GET ATTENDANCE BY ID
============================ */
const getAttendanceById = async (id) => {
    const attendance = await prisma_1.default.attendance.findUnique({
        where: {
            id,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                    email: true,
                    mobile: true,
                    role: {
                        select: {
                            name: true,
                        },
                    },
                    branch: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });
    if (!attendance) {
        throw new Error("Attendance Not Found");
    }
    return {
        success: true,
        attendance,
    };
};
exports.getAttendanceById = getAttendanceById;
const updateAttendance = async (id, data) => {
    const attendance = await prisma_1.default.attendance.findUnique({
        where: {
            id,
        },
    });
    if (!attendance) {
        throw new Error("Attendance Not Found");
    }
    // Existing Values
    const checkIn = data.checkIn
        ? new Date(data.checkIn)
        : attendance.checkIn;
    const checkOut = data.checkOut
        ? new Date(data.checkOut)
        : attendance.checkOut;
    // Working Hours Calculation
    let workingHours = attendance.workingHours;
    let status = attendance.status;
    if (checkIn && checkOut) {
        const diff = checkOut.getTime() - checkIn.getTime();
        const hours = Number((diff / (1000 * 60 * 60)).toFixed(2));
        workingHours = new client_1.Prisma.Decimal(hours);
        // Auto Half Day
        if (hours < 4) {
            status = client_1.AttendanceStatus.HALF_DAY;
        }
    }
    // Manual Status Override
    if (data.status) {
        status = data.status;
    }
    const updatedAttendance = await prisma_1.default.attendance.update({
        where: {
            id,
        },
        data: {
            checkIn,
            checkOut,
            workingHours,
            status,
            remarks: data.remarks ?? attendance.remarks,
        },
        include: {
            employee: true,
        },
    });
    return {
        success: true,
        message: "Attendance Updated Successfully",
        attendance: updatedAttendance,
    };
};
exports.updateAttendance = updateAttendance;
/* ============================
   MONTHLY ATTENDANCE REPORT
============================ */
const monthlyAttendanceReport = async (employeeId, month, year) => {
    // Employee Check
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    const attendances = await prisma_1.default.attendance.findMany({
        where: {
            employeeId,
            attendanceDate: {
                gte: startDate,
                lt: endDate,
            },
        },
        orderBy: {
            attendanceDate: "asc",
        },
    });
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let leave = 0;
    let holiday = 0;
    let totalWorkingHours = 0;
    attendances.forEach((attendance) => {
        switch (attendance.status) {
            case "PRESENT":
                present++;
                break;
            case "LATE":
                late++;
                break;
            case "HALF_DAY":
                halfDay++;
                break;
            case "ABSENT":
                absent++;
                break;
            case "LEAVE":
                leave++;
                break;
            case "HOLIDAY":
                holiday++;
                break;
        }
        if (attendance.workingHours) {
            totalWorkingHours += Number(attendance.workingHours);
        }
    });
    return {
        success: true,
        employee: {
            id: employee.id,
            employeeCode: employee.employeeCode,
            name: employee.name,
        },
        month,
        year,
        summary: {
            totalRecords: attendances.length,
            present,
            late,
            halfDay,
            absent,
            leave,
            holiday,
            totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
        },
        attendances,
    };
};
exports.monthlyAttendanceReport = monthlyAttendanceReport;
