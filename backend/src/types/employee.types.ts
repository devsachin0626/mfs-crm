import { EmployeeStatus, Gender } from "@prisma/client";


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

  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" ;
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

export interface UpdateEmployeeRequest {
  name?: string;
  mobile?: string;
  email?: string;

  gender?: Gender;

  dateOfBirth?: Date;

  address?: string;

  joiningDate?: Date;

  salary?: number;

  branchId?: string;

  roleId?: string;

  reportingManagerId?: string;

  status?: EmployeeStatus;

  isActive?: boolean;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;

  search?: string;

  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  role?: string;

  branch?: string;
}

export interface ChangeEmployeePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ResetEmployeePasswordRequest {
  newPassword: string;
}