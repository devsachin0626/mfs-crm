export type PayrollStatus =
  | "PENDING"
  | "PROCESSED"
  | "PAID";

export interface PayrollEmployee {
  id: string;
  employeeCode: string;
  name: string;
  mobile?: string | null;
  email?: string | null;
}

export interface Payroll {
  id: string;

  employeeId: string;

  month: number;
  year: number;

  basicSalary: string | number;

  workingDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  absentDays: number;

  grossSalary: string | number;

  incentive: string | number;
  bonus: string | number;
  deduction: string | number;

  netSalary: string | number;

  status: PayrollStatus;

  remarks?: string | null;

  employee: PayrollEmployee;

  createdAt?: string;
  updatedAt?: string;
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

  basicSalary: number;

  workingDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  absentDays: number;

  grossSalary: number;

  incentive: number;
  bonus: number;
  deduction: number;

  netSalary: number;

  status?: PayrollStatus;

  remarks?: string;
}

export interface UpdatePayrollPayload {
  month?: number;
  year?: number;

  basicSalary?: number;

  workingDays?: number;
  presentDays?: number;
  lateDays?: number;
  halfDays?: number;
  leaveDays?: number;
  absentDays?: number;

  grossSalary?: number;

  incentive?: number;
  bonus?: number;
  deduction?: number;

  netSalary?: number;

  status?: PayrollStatus;

  remarks?: string;
}