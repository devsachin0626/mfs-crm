/* ============================
   LEAVE STATUS
============================ */

export type LeaveStatusValue =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

/* ============================
   APPLY LEAVE
============================ */

export interface ApplyLeaveRequest {
  employeeId: string;

  fromDate:
    | string
    | Date;

  toDate:
    | string
    | Date;

  reason: string;
}

/* ============================
   UPDATE LEAVE
============================ */

export interface UpdateLeaveRequest {
  fromDate?:
    | string
    | Date;

  toDate?:
    | string
    | Date;

  reason?: string;

  status?:
    LeaveStatusValue;

  approvedById?:
    | string
    | null;
}

/* ============================
   LEAVE QUERY
============================ */

export interface LeaveQuery {
  page?: number;

  limit?: number;

  search?: string;

  status?:
    LeaveStatusValue;

  employeeId?: string;
}