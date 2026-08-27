export interface StartTrialRequest {
  leadId?: string;

  clientId?: string;

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
  page?: number;

  limit?: number;

  status?: string;

  search?: string;

  employeeId?: string;

  leadId?: string;

  clientId?: string;

  productId?: string;
}