import { PayrollStatus } from "@prisma/client";


export interface CreatePayrollRequest {
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

export interface UpdatePayrollRequest {
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