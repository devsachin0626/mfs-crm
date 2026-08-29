export type PayrollStatus =
  | "PENDING"
  | "GENERATED"
  | "APPROVED"
  | "PAID";
export interface PayrollEmployee {
  id: string;

  employeeCode: string;

  name: string;

  mobile?: string | null;

  email?: string | null;

  salary?:
    | string
    | number
    | null;

  role?: {
    name: string;
  } | null;

  branch?: {
    name: string;
  } | null;
}

export interface Payroll {
  id: string;

  employeeId: string;

  month: number;
  year: number;

  periodStart?: string | null;
  periodEnd?: string | null;

  basicSalary: string | number;

  workingDays: number;
  scheduledWorkingDays?: number;

  presentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  absentDays: number;

  paidLeaveDays?: string | number;
  unpaidLeaveDays?: string | number;

  actualLateCount?: number;
  allowedLateCount?: number;
  excessLateCount?: number;

  earlyGoingCount?: number;
  allowedEarlyGoingCount?: number;

  grossSalary: string | number;

  incentive: string | number;
  bonus: string | number;
  deduction: string | number;

  lateDeduction?: string | number;

  netSalary: string | number;

  status: PayrollStatus;

  remarks?: string | null;

  employee: PayrollEmployee;

  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollPreviewResponse {
  success: boolean;

  employee: {
    id: string;
    employeeCode: string;
    name: string;
    salary?: string | number | null;

    role?: {
      name: string;
    };

    branch?: {
      name: string;
    };
  };

  month: number;
  year: number;

  period: {
    start: string;
    end: string;
  };

  attendance: {
    scheduledWorkingDays: number;

    presentDays: number;
    lateDays: number;
    halfDays: number;

    approvedLeaveDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;

    absentDays: number;

    actualLateCount: number;
    allowedLateCount: number;
    excessLateCount: number;

    earlyGoingCount: number;
    allowedEarlyGoingCount: number;
  };

  leaveBalance: {
    openingBalance: number;
    creditedLeave: number;
    availablePaidLeave: number;
    usedPaidLeave: number;
    closingBalance: number;
  };

  salary: {
    basicSalary: number;
    perDaySalary: number;
    payableDays: number;
    grossSalary: number;

    incentive: number;
    bonus: number;

    otherDeduction: number;
    lateDeduction: number;

    netSalary: number;
  };
}

export interface PayrollListResponse {
  success: boolean;

  total: number;
  page: number;
  limit: number;
  totalPages: number;

  payrolls: Payroll[];
}

export interface PayrollQuery {
  page?: number;
  limit?: number;

  search?: string;

  month?: number;
  year?: number;

  status?: string;

  employeeId?: string;
}

export interface CreatePayrollPayload {
  employeeId: string;

  month: number;
  year: number;

  incentive?: number;
  bonus?: number;
  deduction?: number;

  remarks?: string;
}

export interface UpdatePayrollPayload {
  incentive?: number;
  bonus?: number;
  deduction?: number;

  status?: PayrollStatus;

  remarks?: string;
}