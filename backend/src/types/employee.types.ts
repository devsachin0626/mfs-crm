export interface CreateEmployeeRequest {
  name: string;
  mobile: string;
  email?: string;

  password: string;

  gender?: "MALE" | "FEMALE" | "OTHER";

  dateOfBirth?: Date;

  address?: string;

  joiningDate?: Date;

  salary?: number;

  branchId: string;

  roleId: string;

  reportingManagerId?: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  mobile?: string;
  email?: string;

  gender?: "MALE" | "FEMALE" | "OTHER";

  dateOfBirth?: Date;

  address?: string;

  joiningDate?: Date;

  salary?: number;

  branchId?: string;

  roleId?: string;

  reportingManagerId?: string;

  isActive?: boolean;

  status?: "ACTIVE" | "INACTIVE" | "RESIGNED" | "TERMINATED";
}

export interface EmployeeResponse {
  success: boolean;
  message: string;
  employee?: any;
}

export interface EmployeeListResponse {
  success: boolean;
  message: string;
  total: number;
  employees: any[];
}