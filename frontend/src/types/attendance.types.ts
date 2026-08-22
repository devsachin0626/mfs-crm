export interface AttendanceEmployee {
  id: string;
  employeeCode: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
}

export interface Attendance {
  id: string;
  employeeId: string;

  attendanceDate: string;

  checkIn?: string | null;
  checkOut?: string | null;

  workingHours?: number | string | null;

  status:
    | "PRESENT"
    | "LATE"
    | "HALF_DAY"
    | "ABSENT"
    | "LEAVE"
    | "HOLIDAY";

  remarks?: string | null;

  employee?: AttendanceEmployee;

  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceListResponse {
  success: boolean;

  total: number;
  page: number;
  limit: number;
  totalPages: number;

  attendances: Attendance[];
}

export interface AttendanceQuery {
  page?: number;

  limit?: number;

  search?: string;

  status?: string;

  month?: number;

  year?: number;

  employeeId?: string;
}



export interface MonthlyAttendanceReport {
  success: boolean;

  employee: {
    id: string;
    employeeCode: string;
    name: string;
  };

  month: number;
  year: number;

  summary: {
    totalRecords: number;
    present: number;
    late: number;
    halfDay: number;
    absent: number;
    leave: number;
    holiday: number;
    totalWorkingHours: number;
    workingDays: number;
    payableDays: number;
  };

  attendances: Attendance[];
}