"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyAttendanceReport = exports.updateAttendance = exports.getAttendanceById = exports.getAttendances = exports.checkOut = exports.checkIn = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
/* ============================
   ATTENDANCE ACCESS
============================ */
const getAttendanceEmployeeIds = async (currentEmployee) => {
    const roleName = currentEmployee.role?.name;
    /* ADMIN / HR → ALL */
    if (roleName === "ADMIN" ||
        roleName === "HR") {
        return null;
    }
    /* EMPLOYEE → SELF */
    if (roleName === "EMPLOYEE") {
        return [
            currentEmployee.id,
        ];
    }
    /* TEAM LEADER → SELF + TEAM */
    if (roleName ===
        "TEAM_LEADER") {
        const teamMembers = await prisma_1.default.employee.findMany({
            where: {
                reportingManagerId: currentEmployee.id,
            },
            select: {
                id: true,
            },
        });
        return [
            currentEmployee.id,
            ...teamMembers.map((item) => item.id),
        ];
    }
    /* UNKNOWN ROLE → NO ACCESS */
    return [];
};
/* ============================
   CHECK EMPLOYEE ACCESS
============================ */
const checkAttendanceEmployeeAccess = async (employeeId, currentEmployee) => {
    const allowedIds = await getAttendanceEmployeeIds(currentEmployee);
    /* ADMIN / HR */
    if (allowedIds === null) {
        return;
    }
    if (!allowedIds.includes(employeeId)) {
        throw new Error("Attendance Access Denied");
    }
};
/* ============================
   CHECK IN
============================ */
const checkIn = async (data) => {
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
        select: {
            id: true,
            employeeCode: true,
            name: true,
            isActive: true,
            status: true,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    if (!employee.isActive ||
        employee.status !==
            "ACTIVE") {
        throw new Error("Employee Account Inactive");
    }
    /* ============================
       TODAY
    ============================ */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() +
        1);
    /* ============================
       DUPLICATE CHECK
    ============================ */
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
    /* ============================
       CURRENT TIME
    ============================ */
    const now = new Date();
    /* ============================
       LATE RULE - 09:15
    ============================ */
    const lateTime = new Date(today);
    lateTime.setHours(9, 15, 0, 0);
    let status = client_1.AttendanceStatus.PRESENT;
    if (now > lateTime) {
        status =
            client_1.AttendanceStatus.LATE;
    }
    /* ============================
       CREATE ATTENDANCE
    ============================ */
    const attendance = await prisma_1.default.attendance.create({
        data: {
            employeeId: data.employeeId,
            attendanceDate: today,
            checkIn: now,
            status,
            remarks: data.remarks,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
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
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: data.employeeId,
        },
        select: {
            id: true,
            isActive: true,
            status: true,
        },
    });
    if (!employee) {
        throw new Error("Employee Not Found");
    }
    if (!employee.isActive ||
        employee.status !==
            "ACTIVE") {
        throw new Error("Employee Account Inactive");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() +
        1);
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
    if (!attendance.checkIn) {
        throw new Error("Check-In Time Not Found");
    }
    if (attendance.checkOut) {
        throw new Error("Employee Already Checked Out");
    }
    const now = new Date();
    /* ============================
       WORKING HOURS
    ============================ */
    const milliseconds = now.getTime() -
        attendance.checkIn.getTime();
    const workingHours = Number((milliseconds /
        (1000 *
            60 *
            60)).toFixed(2));
    let status = attendance.status;
    /* ============================
       HALF DAY RULE
    ============================ */
    if (workingHours < 4) {
        status =
            client_1.AttendanceStatus.HALF_DAY;
    }
    const updatedAttendance = await prisma_1.default.attendance.update({
        where: {
            id: attendance.id,
        },
        data: {
            checkOut: now,
            workingHours: new client_1.Prisma.Decimal(workingHours),
            status,
            remarks: data.remarks ??
                attendance.remarks,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
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
   GET ATTENDANCES
============================ */
const getAttendances = async (page, limit, search, status, month, year, employeeId, currentEmployee) => {
    const skip = (page - 1) *
        limit;
    const where = {};
    /* ============================
       ROLE ACCESS
    ============================ */
    const allowedIds = await getAttendanceEmployeeIds(currentEmployee);
    if (allowedIds !== null) {
        where.employeeId = {
            in: allowedIds,
        };
    }
    /* ============================
       EMPLOYEE FILTER
    ============================ */
    if (employeeId) {
        await checkAttendanceEmployeeAccess(employeeId, currentEmployee);
        where.employeeId =
            employeeId;
    }
    /* ============================
       SEARCH
    ============================ */
    if (search) {
        where.employee = {
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    employeeCode: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    mobile: {
                        contains: search,
                    },
                },
            ],
        };
    }
    /* ============================
       STATUS FILTER
    ============================ */
    if (status) {
        where.status =
            status;
    }
    /* ============================
       MONTH / YEAR FILTER
    ============================ */
    if (month &&
        year) {
        if (month < 1 ||
            month > 12) {
            throw new Error("Invalid Month");
        }
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        where.attendanceDate =
            {
                gte: startDate,
                lt: endDate,
            };
    }
    const [attendances, total,] = await Promise.all([
        prisma_1.default.attendance.findMany({
            where,
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
            orderBy: [
                {
                    attendanceDate: "desc",
                },
                {
                    checkIn: "desc",
                },
            ],
            skip,
            take: limit,
        }),
        prisma_1.default.attendance.count({
            where,
        }),
    ]);
    return {
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total /
            limit),
        attendances,
    };
};
exports.getAttendances = getAttendances;
/* ============================
   GET ATTENDANCE BY ID
============================ */
const getAttendanceById = async (id, currentEmployee) => {
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
    await checkAttendanceEmployeeAccess(attendance.employeeId, currentEmployee);
    return {
        success: true,
        attendance,
    };
};
exports.getAttendanceById = getAttendanceById;
/* ============================
   UPDATE ATTENDANCE
   ADMIN / HR ONLY
============================ */
const updateAttendance = async (id, data) => {
    const attendance = await prisma_1.default.attendance.findUnique({
        where: {
            id,
        },
    });
    if (!attendance) {
        throw new Error("Attendance Not Found");
    }
    /* ============================
       DATE CONVERSION
    ============================ */
    const checkIn = data.checkIn
        ? new Date(data.checkIn)
        : attendance.checkIn;
    const checkOut = data.checkOut
        ? new Date(data.checkOut)
        : attendance.checkOut;
    if (checkIn &&
        Number.isNaN(checkIn.getTime())) {
        throw new Error("Invalid Check-In Time");
    }
    if (checkOut &&
        Number.isNaN(checkOut.getTime())) {
        throw new Error("Invalid Check-Out Time");
    }
    if (checkIn &&
        checkOut &&
        checkOut <
            checkIn) {
        throw new Error("Check-Out cannot be before Check-In");
    }
    let workingHours = attendance.workingHours;
    let attendanceStatus = attendance.status;
    /* ============================
       CALCULATE HOURS
    ============================ */
    if (checkIn &&
        checkOut) {
        const diff = checkOut.getTime() -
            checkIn.getTime();
        const hours = Number((diff /
            (1000 *
                60 *
                60)).toFixed(2));
        workingHours =
            new client_1.Prisma.Decimal(hours);
        if (hours < 4) {
            attendanceStatus =
                client_1.AttendanceStatus.HALF_DAY;
        }
    }
    /* ============================
       MANUAL STATUS
    ============================ */
    if (data.status) {
        attendanceStatus =
            data.status;
    }
    const updatedAttendance = await prisma_1.default.attendance.update({
        where: {
            id,
        },
        data: {
            checkIn,
            checkOut,
            workingHours,
            status: attendanceStatus,
            remarks: data.remarks ??
                attendance.remarks,
        },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeCode: true,
                    name: true,
                },
            },
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
const monthlyAttendanceReport = async (employeeId, month, year, currentEmployee) => {
    if (month < 1 ||
        month > 12) {
        throw new Error("Invalid Month");
    }
    await checkAttendanceEmployeeAccess(employeeId, currentEmployee);
    const employee = await prisma_1.default.employee.findUnique({
        where: {
            id: employeeId,
        },
        select: {
            id: true,
            employeeCode: true,
            name: true,
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
            case client_1.AttendanceStatus.PRESENT:
                present++;
                break;
            case client_1.AttendanceStatus.LATE:
                late++;
                break;
            case client_1.AttendanceStatus.HALF_DAY:
                halfDay++;
                break;
            case client_1.AttendanceStatus.ABSENT:
                absent++;
                break;
            case client_1.AttendanceStatus.LEAVE:
                leave++;
                break;
            case client_1.AttendanceStatus.HOLIDAY:
                holiday++;
                break;
        }
        if (attendance.workingHours) {
            totalWorkingHours +=
                Number(attendance.workingHours);
        }
    });
    const payableDays = present +
        late +
        halfDay *
            0.5 +
        leave +
        holiday;
    return {
        success: true,
        employee,
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
            payableDays: Number(payableDays.toFixed(2)),
            totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
        },
        attendances,
    };
};
exports.monthlyAttendanceReport = monthlyAttendanceReport;
