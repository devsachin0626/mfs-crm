"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePayrollPolicy = exports.getPayrollCycle = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
/* ============================
   PAYROLL CYCLE
   Example:
   Aug 2026
   => 26 Jul 2026 - 25 Aug 2026
============================ */
const getPayrollCycle = (month, year) => {
    if (month < 1 ||
        month > 12) {
        throw new Error("Invalid Payroll Month");
    }
    const periodEnd = new Date(year, month - 1, 25);
    periodEnd.setHours(23, 59, 59, 999);
    const previousMonth = month === 1
        ? 12
        : month - 1;
    const previousYear = month === 1
        ? year - 1
        : year;
    const periodStart = new Date(previousYear, previousMonth - 1, 26);
    periodStart.setHours(0, 0, 0, 0);
    return {
        periodStart,
        periodEnd,
    };
};
exports.getPayrollCycle = getPayrollCycle;
/* ============================
   DATE HELPERS
============================ */
const normalizeDate = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};
const dateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
/* ============================
   FIRST SATURDAY
============================ */
const isFirstSaturday = (date) => {
    return (date.getDay() === 6 &&
        date.getDate() <= 7);
};
/* ============================
   WORKING DAY CHECK

   OFF DAYS:
   Sunday
   First Saturday
   Company Holiday
============================ */
const isScheduledWorkingDay = (date, holidayKeys) => {
    const key = dateKey(date);
    if (date.getDay() ===
        0) {
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
   LEAVE BALANCE
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
   CALCULATE POLICY
============================ */
const calculatePayrollPolicy = async (input) => {
    const { employeeId, month, year, incentive = 0, bonus = 0, deduction = 0, } = input;
    const { periodStart, periodEnd, } = (0, exports.getPayrollCycle)(month, year);
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
       DATA
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
       MAPS
    ============================ */
    const attendanceMap = new Map();
    attendances.forEach((attendance) => {
        attendanceMap.set(dateKey(attendance.attendanceDate), attendance);
    });
    const holidayKeys = new Set();
    holidays.forEach((holiday) => {
        holidayKeys.add(dateKey(holiday.holidayDate));
    });
    /* ============================
       LEAVE BALANCE
    ============================ */
    const openingBalance = await getOpeningLeaveBalance(employeeId, month, year);
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
    /* ============================
       CURRENT DAY ITERATION
    ============================ */
    const current = normalizeDate(periodStart);
    const end = normalizeDate(periodEnd);
    while (current <= end) {
        const date = new Date(current);
        const key = dateKey(date);
        const workingDay = isScheduledWorkingDay(date, holidayKeys);
        if (!workingDay) {
            current.setDate(current.getDate() +
                1);
            continue;
        }
        scheduledWorkingDays++;
        const attendance = attendanceMap.get(key);
        /* ============================
           LEAVE CHECK
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
           NO ATTENDANCE
        ============================ */
        if (!attendance) {
            absentDays++;
            current.setDate(current.getDate() +
                1);
            continue;
        }
        /* ============================
           CHECK-IN RULE
        ============================ */
        if (attendance.checkIn) {
            const checkIn = new Date(attendance.checkIn);
            const officeStart = new Date(date);
            officeStart.setHours(9, 15, 0, 0);
            const halfDayCutoff = new Date(date);
            halfDayCutoff.setHours(10, 30, 0, 0);
            if (checkIn >
                halfDayCutoff) {
                halfDays++;
            }
            else if (checkIn >
                officeStart) {
                lateDays++;
            }
            else {
                presentDays++;
            }
        }
        else {
            /* fallback based on saved status */
            if (attendance.status ===
                "HALF_DAY") {
                halfDays++;
            }
            else if (attendance.status ===
                "LATE") {
                lateDays++;
            }
            else {
                presentDays++;
            }
        }
        /* ============================
           EARLY GOING
  
           Allowed 1 per cycle.
           Leaving before 6:30 PM
           but at/after 5:00 PM counts
           as early going.
        ============================ */
        if (attendance.checkOut) {
            const checkOut = new Date(attendance.checkOut);
            const earlyStart = new Date(date);
            earlyStart.setHours(17, 0, 0, 0);
            const officeEnd = new Date(date);
            officeEnd.setHours(18, 30, 0, 0);
            if (checkOut >=
                earlyStart &&
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
    const perDaySalary = scheduledWorkingDays >
        0
        ? basicSalary /
            scheduledWorkingDays
        : 0;
    /*
     * Paid attendance:
     *
     * Present
     * Late
     * Half day = 0.5
     * Paid Leave
     *
     * Sundays / First Saturday /
     * Holidays are NOT paid
     */
    const payableDays = presentDays +
        lateDays +
        halfDays *
            0.5 +
        paidLeaveDays;
    const grossSalary = Number((payableDays *
        perDaySalary).toFixed(2));
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
            payableDays,
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
