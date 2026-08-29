import {
  PayrollStatus,
} from "@prisma/client";

/* ============================
   CREATE PAYROLL

   IMPORTANT:
   Salary + Attendance values
   client se accept nahi honge.

   Backend calculate karega.
============================ */

export interface CreatePayrollRequest {
  employeeId: string;

  month: number;

  year: number;

  /*
   * Manual additions
   */

  incentive?: number;

  bonus?: number;

  /*
   * Manual deduction
   */

  deduction?: number;

  /*
   * Optional payroll status
   */

  status?:
    PayrollStatus;

  remarks?: string;
}

/* ============================
   UPDATE PAYROLL

   Calculated fields:
   - basicSalary
   - workingDays
   - presentDays
   - lateDays
   - halfDays
   - leaveDays
   - absentDays
   - grossSalary
   - netSalary

   directly update nahi honge.
============================ */

export interface UpdatePayrollRequest {
  /*
   * Normally month/year should
   * remain fixed after payroll
   * creation.

   * Keeping optional support only
   * if current service requires it.
   */


  incentive?: number;

  bonus?: number;

  deduction?: number;

  status?:
    PayrollStatus;

  remarks?: string;
}

/* ============================
   PAYROLL QUERY
============================ */

export interface PayrollQuery {
  page?: number;

  limit?: number;

  month?: number;

  year?: number;

  employeeId?: string;

  status?:
    PayrollStatus;

  search?: string;
}