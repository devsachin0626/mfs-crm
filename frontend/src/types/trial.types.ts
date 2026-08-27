export type TrialStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED";

export interface TrialClient {
  id: string;
  clientCode: string;
  name: string;
  mobile: string;
  email?: string | null;
  city?: string | null;
  state?: string | null;
}

export interface TrialProduct {
  id: string;
  productCode: string;
  name: string;
  type?: string;
  price?: number | string;
  durationDays?: number | null;
  isTrialAvailable?: boolean;
}

export interface TrialEmployee {
  id: string;
  employeeCode: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
}

export interface Trial {
  id: string;
  trialCode: string;

  clientId: string;
  productId: string;
  employeeId?: string | null;

  startDate: string;
  endDate: string;

  trialDays: number;
  extensionCount: number;

  status: TrialStatus;

  remarks?: string | null;

  createdAt: string;
  updatedAt: string;

  client?: TrialClient;
  product?: TrialProduct;
  employee?: TrialEmployee | null;
}

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

export interface TrialListParams {
  page?: number;
  limit?: number;

  status?: TrialStatus | "";

  search?: string;

  employeeId?: string;
}

export interface TrialListResponse {
  success: boolean;

  total: number;

  page: number;
  limit: number;
  totalPages: number;

  trials: Trial[];
}

export interface TrialDetailsResponse {
  success: boolean;

  trial: Trial;
}

export interface TrialActionResponse {
  success: boolean;

  message: string;

  trial: Trial;
}