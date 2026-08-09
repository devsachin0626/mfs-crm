export interface ApplyLeaveRequest {
  employeeId: string;

  fromDate: Date;

  toDate: Date;

  reason: string;
}

export interface UpdateLeaveRequest {
  fromDate?: Date;

  toDate?: Date;

  reason?: string;

  status?: "PENDING" | "APPROVED" | "REJECTED";

  approvedById?: string;
}

export interface LeaveQuery {
  page?: number;

  limit?: number;

  search?: string;

  status?: "PENDING" | "APPROVED" | "REJECTED";
}