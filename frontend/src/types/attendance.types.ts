/* ============================
   ATTENDANCE STATUS
============================ */

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "HALF_DAY"
  | "ABSENT"
  | "LEAVE"
  | "HOLIDAY";

/* ============================
   ATTENDANCE SOURCE

   Monthly calendar me kuch
   records DB se aur kuch
   backend se generated honge.
============================ */

export type AttendanceSource =
  | "ATTENDANCE"
  | "HOLIDAY"
  | "WEEK_OFF"
  | "LEAVE"
  | "SYSTEM"
  | "FUTURE";

/* ============================
   EMPLOYEE
============================ */

export interface AttendanceEmployee {
  id: string;

  employeeCode: string;

  name: string;

  email?:
    | string
    | null;

  mobile?:
    | string
    | null;

  role?: {
    name: string;
  } | null;

  branch?: {
    name: string;
  } | null;
}

/* ============================
   ATTENDANCE
============================ */

export interface Attendance {
  id: string;

  employeeId: string;

  attendanceDate: string;

  checkIn?:
    | string
    | null;

  checkOut?:
    | string
    | null;

  workingHours?:
    | number
    | string
    | null;

  /*
   * FUTURE calendar dates
   * have no attendance status.
   */

  status:
    | AttendanceStatus
    | null;

  remarks?:
    | string
    | null;

  /*
   * Present for generated
   * monthly calendar records.
   */

  source?:
    AttendanceSource;

  employee?:
    AttendanceEmployee;

  createdAt?:
    string;

  updatedAt?:
    string;
}

/* ============================
   ATTENDANCE LIST RESPONSE

   month/year =
   selected payroll month.

   cycleStart/cycleEnd =
   actual 26 → 25 range.
============================ */

export interface AttendanceListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  month?:
    | number
    | null;

  year?:
    | number
    | null;

  cycleStart?:
    | string
    | null;

  cycleEnd?:
    | string
    | null;

  attendances:
    Attendance[];
}

/* ============================
   ATTENDANCE QUERY
============================ */

export interface AttendanceQuery {
  page?: number;

  limit?: number;

  search?: string;

  status?:
    | AttendanceStatus
    | "";

  /*
   * Payroll month/year.
   *
   * Example:
   *
   * month = 8
   * year = 2026
   *
   * means:
   *
   * 26 Jul 2026
   * →
   * 25 Aug 2026
   */

  month?: number;

  year?: number;

  employeeId?: string;
}

/* ============================
   MONTHLY SUMMARY
============================ */

export interface AttendanceMonthlySummary {
  /*
   * Complete calendar records
   * in selected 26 → 25 cycle.
   */

  totalRecords: number;

  /*
   * Working days excluding
   * weekly/company holidays.
   */

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
   MONTHLY REPORT EMPLOYEE
============================ */

export interface MonthlyAttendanceEmployee {
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
   MONTHLY ATTENDANCE REPORT

   Example:

   month = 8
   year = 2026

   cycleStart =
   2026-07-26

   cycleEnd =
   2026-08-25
============================ */

export interface MonthlyAttendanceReport {
  success: boolean;

  employee:
    MonthlyAttendanceEmployee;

  month: number;

  year: number;

  cycleStart: string;

  cycleEnd: string;

  summary:
    AttendanceMonthlySummary;

  attendances:
    Attendance[];
}

/* ============================
   CHECK-IN RESPONSE
============================ */

export interface AttendanceActionResponse {
  success: boolean;

  message: string;

  attendance:
    Attendance;
}

/* ============================
   ATTENDANCE DETAILS RESPONSE
============================ */

export interface AttendanceDetailsResponse {
  success: boolean;

  attendance:
    Attendance;
}

/* ============================
   UPDATE ATTENDANCE PAYLOAD
============================ */

export interface UpdateAttendancePayload {
  checkIn?:
    | string
    | null;

  checkOut?:
    | string
    | null;

  status?:
    AttendanceStatus;

  remarks?:
    | string
    | null;
}