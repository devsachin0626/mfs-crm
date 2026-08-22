export interface TargetEmployee {
  id: string;
  employeeCode: string;
  name: string;
  mobile?: string | null;
  email?: string | null;
}

export interface EmployeeTarget {
  id: string;

  employeeId: string;

  month: number;
  year: number;

  brokerageTarget: string | number;
  dematTarget: number;
  revenueTarget: string | number;

  achievedAmount: string | number;

  employee: TargetEmployee;

  createdAt: string;
  updatedAt: string;
}

export interface TargetListResponse {
  success: boolean;

  total: number;
  page: number;
  limit: number;
  totalPages: number;

  targets: EmployeeTarget[];
}

export interface TargetQuery {
  page?: number;
  limit?: number;
  search?: string;
  month?: number;
  year?: number;

  employeeId?: string;
}

export interface CreateTargetPayload {
  employeeId: string;

  month: number;
  year: number;

  brokerageTarget: number;
  dematTarget: number;
  revenueTarget: number;
}

export interface UpdateTargetPayload {
  brokerageTarget?: number;
  dematTarget?: number;
  revenueTarget?: number;
  achievedAmount?: number;
}