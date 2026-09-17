export interface CreateTargetRequest {
  employeeId: string;

  month: number;

  year: number;

  brokerageTarget: number;

  dematTarget: number;

  dematAchieved?: number;

  revenueTarget: number;

  preIpoTarget: number;

  preIpoAchieved?: number;
}

export interface UpdateTargetRequest {
  brokerageTarget?: number;

  dematTarget?: number;

  dematAchieved?: number;

  revenueTarget?: number;

  achievedAmount?: number;

  preIpoTarget?: number;

  preIpoAchieved?: number;
}

export interface TargetQuery {
  page?: number;

  limit?: number;

  search?: string;

  month?: number;

  year?: number;
}
