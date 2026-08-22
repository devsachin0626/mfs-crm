export type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface LeaveEmployee {
  id: string;
  employeeCode: string;
  name: string;
  mobile?: string | null;
  email?: string | null;
}

export interface LeaveApprover {
  id: string;
  employeeCode: string;
  name: string;
  mobile?: string | null;
  email?: string | null;
}

export interface Leave {
  id: string;
  employeeId: string;

  fromDate: string;
  toDate: string;

  reason?: string | null;

  status: LeaveStatus;

  approvedById?: string | null;

  employee: LeaveEmployee;

  approvedBy?: LeaveApprover | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveListResponse {
  success: boolean;

  total: number;
  page: number;
  limit: number;
  totalPages: number;

  leaves: Leave[];
}

export interface LeaveQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  employeeId?: string;
}

export interface ApplyLeavePayload {
  fromDate: string;
  toDate: string;
  reason?: string;
}

export interface LeadAssignmentEmployee {
  id: string;
  employeeCode: string;
  name: string;
}

export interface LeadAssignmentHistory {
  id: string;

  leadId: string;

  fromEmployeeId?: string | null;

  fromEmployee?:
    | LeadAssignmentEmployee
    | null;

  toEmployeeId: string;

  toEmployee:
    LeadAssignmentEmployee;

  reason?: string | null;

  createdAt: string;
}