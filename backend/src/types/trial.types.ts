export interface StartTrialRequest {
  clientId: string;
  productId: string;

  employeeId?: string;

  trialDays: number;

  remarks?: string;
}

export interface ExtendTrialRequest {
  trialDays: number;

  remarks?: string;
}

export interface TrialQuery {
  page?: string;

  limit?: string;

  status?: string;

  search?: string;
}