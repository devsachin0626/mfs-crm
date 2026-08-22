export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  mobile: string;
  email?: string | null;
  gender?: string | null;

  status: string;
  isActive: boolean;

  joiningDate?: string | null;

  role: string;
  branch: string;

  reportingManager?: string | null;

  createdAt: string;
}

export interface EmployeeListResponse {
  success: boolean;

  page: number;
  limit: number;
  total: number;
  totalPages: number;

  employees: Employee[];
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  branch?: string;
}

export interface EmployeeDetails {
  id: string;
  employeeCode: string;
  name: string;
  mobile: string;
  email?: string | null;
  gender?: string | null;

  dateOfBirth?: string | null;
  address?: string | null;
  profileImage?: string | null;

  joiningDate?: string | null;
  salary?: string | number | null;

  status: string;
  isActive: boolean;

  role: {
    id: string;
    name: string;
  };

  branch: {
    id: string;
    name: string;
    branchCode: string;
  };

  reportingManager?: {
    id: string;
    employeeCode: string;
    name: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  mobile: string;
  email?: string;
  password: string;

  gender?: string;

  dateOfBirth?: string;
  address?: string;

  joiningDate?: string;
  salary?: number;

  branchId: string;
  roleId: string;

  reportingManagerId?: string;
}

export interface UpdateEmployeePayload {
  name?: string;
  mobile?: string;
  email?: string;

  gender?: string;

  dateOfBirth?: string;
  address?: string;

  joiningDate?: string;
  salary?: number;

  branchId?: string;
  roleId?: string;

  reportingManagerId?: string;

  status?: string;
  isActive?: boolean;
}

export interface BranchOption {
  id: string;
  name: string;
  branchCode: string;
}

export interface RoleOption {
  id: string;
  name: string;
}