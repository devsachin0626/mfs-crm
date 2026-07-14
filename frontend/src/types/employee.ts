export type EmployeeRole =
  | "Admin"
  | "HR"
  | "Accounts"
  | "Team Leader"
  | "Sales Executive";

export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  mobile: string;
  email: string;

  role: EmployeeRole;

  active: boolean;
}