export interface TargetEmployee {
  id: string;

  employeeCode: string;

  name: string;

  mobile?: string | null;

  email?: string | null;

  role?: {
    name: string;
  };

  branch?: {
    name: string;
  };
}

export interface EmployeeTarget {
  id: string;

  employeeId: string;

  month: number;

  year: number;

  brokerageTarget:
    | number
    | string;

  dematTarget: number;

  revenueTarget:
    | number
    | string;

  achievedAmount:
    | number
    | string;

  progressPercent?: number;

  employee: TargetEmployee;

  createdAt?: string;

  updatedAt?: string;

periodStart?: string;
periodEnd?: string;
}

export interface TargetListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  targets: EmployeeTarget[];
}

export interface TargetDetailsResponse {
  success: boolean;

  target: EmployeeTarget;
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