export interface CheckInRequest {
  employeeId: string;
  remarks?: string;
}

export interface CheckOutRequest {
  employeeId: string;
  remarks?: string;
}

export interface UpdateAttendanceRequest {
  checkIn?: Date;
  checkOut?: Date;
  status?: "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "LEAVE" | "HOLIDAY";
  remarks?: string;
}

export interface AttendanceQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  month?: number;
  year?: number;
  status?: "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "LEAVE" | "HOLIDAY";
}