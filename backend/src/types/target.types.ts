export interface CreateTargetRequest {
  employeeId: string;

  month: number;

  year: number;

  brokerageTarget: number;

  dematTarget: number;

  revenueTarget: number;
}

export interface UpdateTargetRequest {
  brokerageTarget?: number;

  dematTarget?: number;

  revenueTarget?: number;

  achievedAmount?: number;
}

export interface TargetQuery {
  page?: number;

  limit?: number;

  search?: string;

  month?: number;

  year?: number;
}