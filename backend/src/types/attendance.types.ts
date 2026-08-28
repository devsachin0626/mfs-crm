/* ============================
   ATTENDANCE STATUS
============================ */

export type AttendanceStatusValue =
  | "PRESENT"
  | "LATE"
  | "HALF_DAY"
  | "ABSENT"
  | "LEAVE"
  | "HOLIDAY";

/* ============================
   ATTENDANCE SOURCE

   Monthly calendar me record
   kahan se generate hua.
============================ */

export type AttendanceSource =
  | "ATTENDANCE"
  | "HOLIDAY"
  | "WEEK_OFF"
  | "LEAVE"
  | "SYSTEM"
  | "FUTURE";

/* ============================
   CHECK IN
============================ */

export interface CheckInRequest {
  employeeId: string;

  remarks?: string;
}

/* ============================
   CHECK OUT
============================ */

export interface CheckOutRequest {
  employeeId: string;

  remarks?: string;
}

/* ============================
   UPDATE ATTENDANCE
============================ */

export interface UpdateAttendanceRequest {
  checkIn?:
    | Date
    | string
    | null;

  checkOut?:
    | Date
    | string
    | null;

  status?:
    AttendanceStatusValue;

  remarks?:
    | string
    | null;
}

/* ============================
   ATTENDANCE LIST QUERY

   IMPORTANT:

   month/year =
   payroll attendance cycle.

   Example:

   month = 8
   year = 2026

   means:

   26 Jul 2026
      →
   25 Aug 2026
============================ */

export interface AttendanceQuery {
  page?: number;

  limit?: number;

  search?: string;

  employeeId?: string;

  month?: number;

  year?: number;

  status?:
    AttendanceStatusValue;
}

/* ============================
   MONTHLY REPORT QUERY
============================ */

export interface MonthlyAttendanceQuery {
  employeeId: string;

  month: number;

  year: number;
}

/* ============================
   EMPLOYEE SUMMARY
============================ */

export interface AttendanceEmployeeSummary {
  id: string;

  employeeCode: string;

  name: string;

  role?: {
    name: string;
  } | null;

  branch?: {
    name: string;
  } | null;
}

/* ============================
   MONTHLY SUMMARY
============================ */

export interface AttendanceMonthlySummary {
  totalRecords: number;

  workingDays: number;

  present: number;

  late: number;

  halfDay: number;

  absent: number;

  leave: number;

  holiday: number;

  payableDays: number;

  totalWorkingHours: number;
}

/* ============================
   CALENDAR ITEM
============================ */

export interface AttendanceCalendarItem {
  id: string;

  employeeId: string;

  attendanceDate:
    | Date
    | string;

  checkIn?:
    | Date
    | string
    | null;

  checkOut?:
    | Date
    | string
    | null;

  workingHours?:
    | number
    | string
    | null;

  status:
    | AttendanceStatusValue
    | null;

  remarks?:
    | string
    | null;

  source:
    AttendanceSource;
}

/* ============================
   MONTHLY REPORT RESPONSE
============================ */

export interface MonthlyAttendanceReport {
  success: boolean;

  employee:
    AttendanceEmployeeSummary;

  /*
   * Selected payroll month.
   *
   * August 2026
   * =
   * month 8 / year 2026
   */

  month: number;

  year: number;

  /*
   * Actual cycle:
   *
   * 26 previous month
   * →
   * 25 selected month
   */

  cycleStart:
    | Date
    | string;

  cycleEnd:
    | Date
    | string;

  summary:
    AttendanceMonthlySummary;

  attendances:
    AttendanceCalendarItem[];
}