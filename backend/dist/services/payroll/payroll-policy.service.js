"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePayrollPolicy = exports.getPayrollCycle = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const settings_service_1 = require("../settings/settings.service");
/* ============================
   PAYROLL CYCLE

   Example:

   August 2026
   =
   26 Jul 2026
      →
   25 Aug 2026
============================ */
const getPayrollCycle = (month, year) => {
    if (!Number.isInteger(month) ||
        month < 1 ||
        month > 12) {
        throw new Error("Invalid Payroll Month");
    }
    if (!Number.isInteger(year) ||
        year < 2000 ||
        year > 2200) {
        throw new Error("Invalid Payroll Year");
    }
    const periodStart = new Date(year, month - 2, 26);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(year, month - 1, 25);
    periodEnd.setHours(23, 59, 59, 999);
    return {
        periodStart,
        periodEnd,
    };
};
exports.getPayrollCycle = getPayrollCycle;
/* ============================
   DATE HELPERS
============================ */
const normalizeDate = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};
const dateKey = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
/* ============================
   TIME HELPER
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
   FIRST SATURDAY
============================ */
const isFirstSaturday = (date) => {
    return (date.getDay() === 6 &&
        date.getDate() <= 7);
};
/* ============================
   SCHEDULED WORKING DAY

   OFF:
   - Sunday
   - First Saturday
   - Company Holiday
============================ */
const isScheduledWorkingDay = (date, holidayKeys) => {
    const key = dateKey(date);
    if (date.getDay() === 0) {
        return false;
    }
    if (isFirstSaturday(date)) {
        return false;
    }
    if (holidayKeys.has(key)) {
        return false;
    }
    return true;
};
/* ============================
   OPENING LEAVE BALANCE
============================ */
const getOpeningLeaveBalance = async (employeeId, month, year) => {
    const previousMonth = month === 1
        ? 12
        : month - 1;
    const previousYear = month === 1
        ? year - 1
        : year;
    const previous = await prisma_1.default.employeeLeaveBalance.findUnique({
        where: {
            employeeId_month_year: {
                employeeId,
                month: previousMonth,
                year: previousYear,
            },
        },
    });
    return previous
        ? Number(previous.closingBalance)
        : 0;
};
/* ============================
   PAYROLL POLICY
============================ */
const calculatePayrollPolicy = async (input) => {
    const { employeeId, month, year, incentive = 0, bonus = 0, deduction = 0, } = input;
    const { periodStart, periodEnd, } = (0, exports.getPayrollCycle)(month, year);
    /* ============================
       SETTINGS
    ============================ */
    const settings = await getAttendanceSettings();
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
            salary: true,
            isActive: true,
            status: true,
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
    if (!employee.isActive ||
        employee.status !==
            "ACTIVE") {
        throw new Error("Employee Account Inactive");
    }
    /* ============================
       FETCH DATA
    ============================ */
    const [attendances, holidays, approvedLeaves,] = await Promise.all([
        prisma_1.default.attendance.findMany({
            where: {
                employeeId,
                attendanceDate: {
                    gte: periodStart,
                    lte: periodEnd,
                },
            },
            orderBy: {
                attendanceDate: "asc",
            },
        }),
        prisma_1.default.holiday.findMany({
            where: {
                holidayDate: {
                    gte: periodStart,
                    lte: periodEnd,
                },
            },
        }),
        prisma_1.default.leave.findMany({
            where: {
                employeeId,
                status: "APPROVED",
                fromDate: {
                    lte: periodEnd,
                },
                toDate: {
                    gte: periodStart,
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
    attendances.forEach((attendance) => {
        attendanceMap.set(dateKey(attendance.attendanceDate), attendance);
    });
    /* ============================
       HOLIDAY MAP
    ============================ */
    const holidayKeys = new Set();
    holidays.forEach((holiday) => {
        holidayKeys.add(dateKey(holiday.holidayDate));
    });
    /* ============================
       LEAVE BALANCE
    ============================ */
    const openingBalance = await getOpeningLeaveBalance(employeeId, month, year);
    /*
     * Current company rule:
     * 1 paid leave credited
     * per payroll cycle.
     */
    const creditedLeave = 1;
    const availablePaidLeave = openingBalance +
        creditedLeave;
    /* ============================
       COUNTERS
    ============================ */
    let scheduledWorkingDays = 0;
    let presentDays = 0;
    let lateDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let approvedLeaveDays = 0;
    let earlyGoingCount = 0;
    let weeklyOffDays = 0;
    let holidayDays = 0;
    /* ============================
       PERIOD LOOP
    ============================ */
    const current = normalizeDate(periodStart);
    const end = normalizeDate(periodEnd);
    while (current <= end) {
        const date = new Date(current);
        const key = dateKey(date);
        /* ============================
           WEEKLY / HOLIDAY
        ============================ */
        const isSunday = date.getDay() === 0;
        const firstSaturday = isFirstSaturday(date);
        const companyHoliday = holidayKeys.has(key);
        if (isSunday ||
            firstSaturday) {
            weeklyOffDays++;
            current.setDate(current.getDate() +
                1);
            continue;
        }
        if (companyHoliday) {
            holidayDays++;
            current.setDate(current.getDate() +
                1);
            continue;
        }
        scheduledWorkingDays++;
        /* ============================
           APPROVED LEAVE
        ============================ */
        const approvedLeave = approvedLeaves.find((leave) => {
            const from = normalizeDate(leave.fromDate);
            const to = normalizeDate(leave.toDate);
            return (date >= from &&
                date <= to);
        });
        if (approvedLeave) {
            approvedLeaveDays++;
            current.setDate(current.getDate() +
                1);
            continue;
        }
        /* ============================
           ATTENDANCE
        ============================ */
        const attendance = attendanceMap.get(key);
        if (!attendance) {
            absentDays++;
            current.setDate(current.getDate() +
                1);
            continue;
        }
        /* ============================
           STATUS
  
           Prefer actual Check-In
           against current Settings.
  
           If Check-In not present,
           fallback to saved status.
        ============================ */
        if (attendance.checkIn) {
            const checkIn = new Date(attendance.checkIn);
            const lateAfter = applyTimeToDate(date, settings.lateAfterTime);
            const halfDayAfter = applyTimeToDate(date, settings.halfDayAfterTime);
            if (checkIn >
                halfDayAfter) {
                halfDays++;
            }
            else if (checkIn >
                lateAfter) {
                lateDays++;
            }
            else {
                presentDays++;
            }
        }
        else {
            switch (attendance.status) {
                case client_1.AttendanceStatus.HALF_DAY:
                    halfDays++;
                    break;
                case client_1.AttendanceStatus.LATE:
                    lateDays++;
                    break;
                case client_1.AttendanceStatus.ABSENT:
                    absentDays++;
                    break;
                case client_1.AttendanceStatus.LEAVE:
                    approvedLeaveDays++;
                    break;
                case client_1.AttendanceStatus.HOLIDAY:
                    /*
                     * Manual holiday record
                     * should not reduce salary.
                     */
                    holidayDays++;
                    scheduledWorkingDays--;
                    break;
                case client_1.AttendanceStatus.PRESENT:
                default:
                    presentDays++;
                    break;
            }
        }
        /* ============================
           EARLY GOING
  
           Current policy:
           Check-Out within 90 minutes
           before office closing
           counts as Early Going.
  
           Example:
           Office End 18:30
           Early window begins 17:00.
        ============================ */
        if (attendance.checkOut) {
            const checkOut = new Date(attendance.checkOut);
            const officeEnd = applyTimeToDate(date, settings.officeEndTime);
            const earlyWindowStart = new Date(officeEnd);
            earlyWindowStart.setMinutes(earlyWindowStart.getMinutes() -
                90);
            if (checkOut >=
                earlyWindowStart &&
                checkOut <
                    officeEnd) {
                earlyGoingCount++;
            }
        }
        current.setDate(current.getDate() +
            1);
    }
    /* ============================
       PAID / UNPAID LEAVE
    ============================ */
    const paidLeaveDays = Math.min(approvedLeaveDays, availablePaidLeave);
    const unpaidLeaveDays = Math.max(approvedLeaveDays -
        paidLeaveDays, 0);
    const closingBalance = Math.max(availablePaidLeave -
        paidLeaveDays, 0);
    /* ============================
       LATE POLICY
    ============================ */
    const allowedLateCount = 3;
    const actualLateCount = lateDays;
    const excessLateCount = Math.max(actualLateCount -
        allowedLateCount, 0);
    /*
     * Current existing rule:
     * ₹100 deduction for each
     * excess late.
     */
    const lateDeduction = excessLateCount *
        100;
    /* ============================
       EARLY GOING POLICY
    ============================ */
    const allowedEarlyGoingCount = 1;
    /* ============================
       SALARY
    ============================ */
    const basicSalary = Number(employee.salary ||
        0);
    /*
     * Monthly salary is divided
     * only by scheduled working
     * days.
     *
     * Sundays / First Saturday /
     * Company Holidays are part
     * of monthly fixed salary.
     */
    const perDaySalary = scheduledWorkingDays >
        0
        ? basicSalary /
            scheduledWorkingDays
        : 0;
    /*
     * Effective paid working days.
     */
    const paidWorkingDays = presentDays +
        lateDays +
        halfDays *
            0.5 +
        paidLeaveDays;
    /*
     * Salary-loss days:
     *
     * - Absent
     * - Unpaid Leave
     * - Half Day unpaid portion
     *
     * Using scheduled days as
     * denominator ensures full
     * attendance = full monthly
     * basic salary.
     */
    const unpaidDayEquivalent = Math.max(scheduledWorkingDays -
        paidWorkingDays, 0);
    const attendanceDeduction = Number((unpaidDayEquivalent *
        perDaySalary).toFixed(2));
    const grossSalary = Number(Math.max(basicSalary -
        attendanceDeduction, 0).toFixed(2));
    const safeIncentive = Math.max(Number(incentive) || 0, 0);
    const safeBonus = Math.max(Number(bonus) || 0, 0);
    const safeDeduction = Math.max(Number(deduction) || 0, 0);
    const netSalary = Number(Math.max(grossSalary +
        safeIncentive +
        safeBonus -
        safeDeduction -
        lateDeduction, 0).toFixed(2));
    /* ============================
       RESULT
    ============================ */
    return {
        employee,
        month,
        year,
        period: {
            start: periodStart,
            end: periodEnd,
        },
        attendance: {
            scheduledWorkingDays,
            weeklyOffDays,
            holidayDays,
            presentDays,
            lateDays,
            halfDays,
            approvedLeaveDays,
            paidLeaveDays,
            unpaidLeaveDays,
            absentDays,
            actualLateCount,
            allowedLateCount,
            excessLateCount,
            earlyGoingCount,
            allowedEarlyGoingCount,
        },
        leaveBalance: {
            openingBalance,
            creditedLeave,
            availablePaidLeave,
            usedPaidLeave: paidLeaveDays,
            closingBalance,
        },
        salary: {
            basicSalary,
            perDaySalary: Number(perDaySalary.toFixed(2)),
            /*
             * Backward-compatible
             * payableDays field.
             */
            payableDays: Number(paidWorkingDays.toFixed(2)),
            paidWorkingDays: Number(paidWorkingDays.toFixed(2)),
            unpaidDayEquivalent: Number(unpaidDayEquivalent.toFixed(2)),
            attendanceDeduction,
            grossSalary,
            incentive: safeIncentive,
            bonus: safeBonus,
            otherDeduction: safeDeduction,
            lateDeduction,
            netSalary,
        },
    };
};
exports.calculatePayrollPolicy = calculatePayrollPolicy;
