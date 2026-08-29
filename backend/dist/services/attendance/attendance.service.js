"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyAttendanceReport = exports.updateAttendance = exports.getAttendanceById = exports.getAttendances = exports.checkOut = exports.checkIn = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const settings_service_1 = require("../settings/settings.service");
/* ============================
   DATE HELPERS
============================ */
const startOfDay = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};
const addDays = (value, days) => {
    const date = new Date(value);
    date.setDate(date.getDate() +
        days);
    return date;
};
/* ============================
   DATE KEY
============================ */
const dateKey = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
/* ============================
   PAYROLL CYCLE

   Example:
   month = 8
   year  = 2026

   26 Jul 2026
      →
   25 Aug 2026

   endExclusive = 26 Aug
============================ */
const getAttendanceCycle = (month, year) => {
    if (!Number.isInteger(month) ||
        month < 1 ||
        month > 12) {
        throw new Error("Invalid Month");
    }
    if (!Number.isInteger(year) ||
        year < 2000 ||
        year > 2200) {
        throw new Error("Invalid Year");
    }
    const startDate = new Date(year, month - 2, 26);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month - 1, 25);
    endDate.setHours(23, 59, 59, 999);
    const endExclusive = new Date(year, month - 1, 26);
    endExclusive.setHours(0, 0, 0, 0);
    return {
        startDate,
        endDate,
        endExclusive,
    };
};
/* ============================
   TIME SETTING HELPER

   "09:45"
      ↓
   Date with 09:45
============================ */
const applyTimeToDate = (baseDate, time) => {
    const [hourText, minuteText,] = time.split(":");
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (!Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59) {
        throw new Error(`Invalid Attendance Time Setting: ${time}`);
    }
    const result = new Date(baseDate);
    result.setHours(hour, minute, 0, 0);
    return result;
};
/* ============================
   ATTENDANCE SETTINGS
============================ */
const getAttendanceSettings = async () => {
    const [officeStartTime, officeEndTime, lateAfterTime, halfDayAfterTime,] = await Promise.all([
        (0, settings_service_1.getSettingValue)("OFFICE_START_TIME"),
        (0, settings_service_1.getSettingValue)("OFFICE_END_TIME"),
        (0, settings_service_1.getSettingValue)("LATE_AFTER_TIME"),
        (0, settings_service_1.getSettingValue)("HALF_DAY_AFTER_TIME"),
    ]);
    return {
        officeStartTime,
        officeEndTime,
        lateAfterTime,
        halfDayAfterTime,
    };
};
/* ============================
   AUTO ATTENDANCE STATUS

   Before / at late time
   → PRESENT

   After late time
   → LATE

   After half-day time
   → HALF_DAY
============================ */
const getCheckInStatus = (now, lateAfterTime, halfDayAfterTime) => {
    const day = startOfDay(now);
    const lateTime = applyTimeToDate(day, lateAfterTime);
    const halfDayTime = applyTimeToDate(day, halfDayAfterTime);
    if (now >
        halfDayTime) {
        return client_1.AttendanceStatus.HALF_DAY;
    }
    if (now >
        lateTime) {
        return client_1.AttendanceStatus.LATE;
    }
    return client_1.AttendanceStatus.PRESENT;
};
/* ============================
   ATTENDANCE ACCESS
============================ */
const getAttendanceEmployeeIds = async (currentEmployee) => {
    const roleName = currentEmployee.role
        ?.name;
    /* ADMIN / HR */
    if (roleName ===
        "ADMIN" ||
        roleName ===
            "HR") {
        return null;
    }
    /* EMPLOYEE */
    if (roleName ===
        "EMPLOYEE") {
        return [
            currentEmployee.id,
        ];
    }
    /* TEAM LEADER */
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
    return [];
};
/* ============================
   CHECK EMPLOYEE ACCESS
============================ */
const checkAttendanceEmployeeAccess = async (employeeId, currentEmployee) => {
    const allowedIds = await getAttendanceEmployeeIds(currentEmployee);
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
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
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
       SETTINGS
    ============================ */
    const settings = await getAttendanceSettings();
    /* ============================
       STATUS
    ============================ */
    const status = getCheckInStatus(now, settings.lateAfterTime, settings.halfDayAfterTime);
    /* ============================
       CREATE
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
        message: status ===
            client_1.AttendanceStatus.HALF_DAY
            ? "Check In Successful - Half Day"
            : status ===
                client_1.AttendanceStatus.LATE
                ? "Check In Successful - Late"
                : "Check In Successful",
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
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
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
    if (now <
        attendance.checkIn) {
        throw new Error("Invalid Check-Out Time");
    }
    /* ============================
       WORKING HOURS
    ============================ */
    const milliseconds = now.getTime() -
        attendance.checkIn.getTime();
    const workingHours = Number((milliseconds /
        (1000 *
            60 *
            60)).toFixed(2));
    /*
     * IMPORTANT
     *
     * Half-day is decided from
     * HALF_DAY_AFTER_TIME during
     * check-in.
     *
     * We do NOT use the old
     * hard-coded < 4 hours rule.
     */
    const updatedAttendance = await prisma_1.default.attendance.update({
        where: {
            id: attendance.id,
        },
        data: {
            checkOut: now,
            workingHours: new client_1.Prisma.Decimal(workingHours),
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
       STATUS
    ============================ */
    if (status) {
        where.status =
            status;
    }
    /* ============================
       PAYROLL CYCLE FILTER
    ============================ */
    let cycleStart = null;
    let cycleEnd = null;
    if (month &&
        year) {
        const cycle = getAttendanceCycle(month, year);
        cycleStart =
            cycle.startDate;
        cycleEnd =
            cycle.endDate;
        where.attendanceDate =
            {
                gte: cycle.startDate,
                lt: cycle.endExclusive,
            };
    }
    /* ============================
       FETCH
    ============================ */
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
        month: month ?? null,
        year: year ?? null,
        cycleStart,
        cycleEnd,
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
   ADMIN / HR
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
       RECALCULATE HOURS
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
    }
    /* ============================
       AUTO STATUS FROM CHECK-IN

       Only when admin has NOT
       manually supplied status.
    ============================ */
    if (checkIn &&
        !data.status) {
        const settings = await getAttendanceSettings();
        attendanceStatus =
            getCheckInStatus(checkIn, settings.lateAfterTime, settings.halfDayAfterTime);
    }
    /* ============================
       MANUAL STATUS WINS
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

   month/year represent
   PAYROLL MONTH.

   Example:
   August 2026
   =
   26 Jul → 25 Aug
============================ */
const monthlyAttendanceReport = async (employeeId, month, year, currentEmployee) => {
    const { startDate, endDate, endExclusive, } = getAttendanceCycle(month, year);
    /* ============================
       ACCESS
    ============================ */
    await checkAttendanceEmployeeAccess(employeeId, currentEmployee);
    /* ============================
       EMPLOYEE
    ============================ */
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
    /* ============================
       FETCH CYCLE DATA
    ============================ */
    const [attendances, holidays, approvedLeaves,] = await Promise.all([
        prisma_1.default.attendance.findMany({
            where: {
                employeeId,
                attendanceDate: {
                    gte: startDate,
                    lt: endExclusive,
                },
            },
            orderBy: {
                attendanceDate: "asc",
            },
        }),
        prisma_1.default.holiday.findMany({
            where: {
                holidayDate: {
                    gte: startDate,
                    lt: endExclusive,
                },
            },
        }),
        prisma_1.default.leave.findMany({
            where: {
                employeeId,
                status: "APPROVED",
                fromDate: {
                    lt: endExclusive,
                },
                toDate: {
                    gte: startDate,
                },
            },
            orderBy: {
                fromDate: "asc",
            },
        }),
    ]);
    /* ============================
       ATTENDANCE MAP
    ============================ */
    const attendanceMap = new Map();
    attendances.forEach((item) => {
        attendanceMap.set(dateKey(item.attendanceDate), item);
    });
    /* ============================
       HOLIDAY MAP
    ============================ */
    const holidayMap = new Map();
    holidays.forEach((item) => {
        holidayMap.set(dateKey(item.holidayDate), item);
    });
    /* ============================
       APPROVED LEAVE FINDER
    ============================ */
    const findApprovedLeave = (value) => {
        const currentDate = startOfDay(value);
        return approvedLeaves.find((leaveItem) => {
            const fromDate = startOfDay(leaveItem.fromDate);
            const toDate = startOfDay(leaveItem.toDate);
            return (currentDate >=
                fromDate &&
                currentDate <=
                    toDate);
        });
    };
    /* ============================
       TODAY
    ============================ */
    const today = startOfDay(new Date());
    /* ============================
       COUNTERS
    ============================ */
    let present = 0;
    let late = 0;
    let halfDay = 0;
    let absent = 0;
    let leave = 0;
    let holiday = 0;
    let workingDays = 0;
    let totalWorkingHours = 0;
    const calendar = [];
    /* ============================
       BUILD COMPLETE 26 → 25
       CALENDAR
    ============================ */
    let currentDate = new Date(startDate);
    while (currentDate <
        endExclusive) {
        const date = startOfDay(currentDate);
        const key = dateKey(date);
        const attendance = attendanceMap.get(key);
        const companyHoliday = holidayMap.get(key);
        const approvedLeave = findApprovedLeave(date);
        const isSunday = date.getDay() ===
            0;
        const isFirstSaturday = date.getDay() === 6 &&
            date.getDate() <= 7;
        const isWeeklyOff = isSunday ||
            isFirstSaturday;
        const isFuture = date >
            today;
        /* ============================
           PRIORITY 1:
           ACTUAL ATTENDANCE
        ============================ */
        if (attendance) {
            switch (attendance.status) {
                case client_1.AttendanceStatus.PRESENT:
                    present++;
                    workingDays++;
                    break;
                case client_1.AttendanceStatus.LATE:
                    late++;
                    workingDays++;
                    break;
                case client_1.AttendanceStatus.HALF_DAY:
                    halfDay++;
                    workingDays++;
                    break;
                case client_1.AttendanceStatus.ABSENT:
                    absent++;
                    workingDays++;
                    break;
                case client_1.AttendanceStatus.LEAVE:
                    leave++;
                    workingDays++;
                    break;
                case client_1.AttendanceStatus.HOLIDAY:
                    holiday++;
                    break;
            }
            if (attendance.workingHours !==
                null &&
                attendance.workingHours !==
                    undefined) {
                totalWorkingHours +=
                    Number(attendance.workingHours);
            }
            calendar.push({
                ...attendance,
                source: "ATTENDANCE",
            });
            currentDate =
                addDays(currentDate, 1);
            continue;
        }
        /* ============================
           PRIORITY 2:
           COMPANY HOLIDAY
        ============================ */
        if (companyHoliday) {
            holiday++;
            calendar.push({
                id: `holiday-${key}`,
                employeeId,
                attendanceDate: date,
                status: "HOLIDAY",
                checkIn: null,
                checkOut: null,
                workingHours: null,
                remarks: companyHoliday.title,
                source: "HOLIDAY",
            });
            currentDate =
                addDays(currentDate, 1);
            continue;
        }
        /* ============================
           PRIORITY 3:
           WEEKLY OFF
        ============================ */
        if (isWeeklyOff) {
            holiday++;
            calendar.push({
                id: `weekoff-${key}`,
                employeeId,
                attendanceDate: date,
                status: "HOLIDAY",
                checkIn: null,
                checkOut: null,
                workingHours: null,
                remarks: isFirstSaturday
                    ? "First Saturday Off"
                    : "Sunday Weekly Off",
                source: "WEEK_OFF",
            });
            currentDate =
                addDays(currentDate, 1);
            continue;
        }
        /* ============================
           PRIORITY 4:
           APPROVED LEAVE
        ============================ */
        if (approvedLeave) {
            leave++;
            workingDays++;
            calendar.push({
                id: `leave-${key}`,
                employeeId,
                attendanceDate: date,
                status: "LEAVE",
                checkIn: null,
                checkOut: null,
                workingHours: null,
                remarks: approvedLeave.reason,
                source: "LEAVE",
            });
            currentDate =
                addDays(currentDate, 1);
            continue;
        }
        /* ============================
           PRIORITY 5:
           FUTURE
        ============================ */
        if (isFuture) {
            calendar.push({
                id: `future-${key}`,
                employeeId,
                attendanceDate: date,
                status: null,
                checkIn: null,
                checkOut: null,
                workingHours: null,
                remarks: null,
                source: "FUTURE",
            });
            currentDate =
                addDays(currentDate, 1);
            continue;
        }
        /* ============================
           PRIORITY 6:
           ABSENT
        ============================ */
        absent++;
        workingDays++;
        calendar.push({
            id: `absent-${key}`,
            employeeId,
            attendanceDate: date,
            status: "ABSENT",
            checkIn: null,
            checkOut: null,
            workingHours: null,
            remarks: "No Attendance Record",
            source: "SYSTEM",
        });
        currentDate =
            addDays(currentDate, 1);
    }
    /* ============================
       PAYABLE DAYS
    ============================ */
    const payableDays = present +
        late +
        halfDay *
            0.5 +
        leave +
        holiday;
    /* ============================
       RETURN
    ============================ */
    return {
        success: true,
        employee,
        /*
         * Selected payroll month
         */
        month,
        year,
        /*
         * Actual attendance cycle
         */
        cycleStart: startDate,
        cycleEnd: endDate,
        summary: {
            totalRecords: calendar.length,
            workingDays,
            present,
            late,
            halfDay,
            absent,
            leave,
            holiday,
            payableDays: Number(payableDays.toFixed(2)),
            totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
        },
        attendances: calendar,
    };
};
exports.monthlyAttendanceReport = monthlyAttendanceReport;
