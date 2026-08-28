/* ============================
   STATUS
============================ */

export type TrialStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED";

/* ============================
   LEAD
============================ */

export interface TrialLead {
  id: string;

  leadCode: string;

  name?: string | null;

  mobile: string;

  email?: string | null;

  city?: string | null;

  state?: string | null;

  address?: string | null;

  stage?: string;

  isConverted?: boolean;

  assignedEmployeeId?: string | null;
}

/* ============================
   CLIENT
============================ */

export interface TrialClient {
  id: string;

  clientCode: string;

  name: string;

  mobile: string;

  email?: string | null;

  city?: string | null;

  state?: string | null;

  address?: string | null;

  isActive?: boolean;
}

/* ============================
   OLD PRODUCT
   Historical compatibility
============================ */

export interface TrialProduct {
  id: string;

  productCode: string;

  name: string;

  type?: string | null;

  price?: number | string | null;

  durationDays?: number | null;

  isTrialAvailable?: boolean;
}

/* ============================
   NEW DEMO PRODUCT
============================ */

export interface TrialDemoProduct {
  id: string;

  code: string;

  name: string;

  description?: string | null;

  isActive?: boolean;

  sortOrder?: number;
}

/* ============================
   EMPLOYEE
============================ */

export interface TrialEmployee {
  id: string;

  employeeCode: string;

  name: string;

  email?: string | null;

  mobile?: string | null;
}

/* ============================
   TRIAL
============================ */

export interface Trial {
  id: string;

  trialCode: string;

  leadId?: string | null;

  clientId?: string | null;

  /*
   * OLD PRODUCT
   * Historical trials only
   */

  productId?: string | null;

  /*
   * NEW DEMO PRODUCT
   */

  demoProductId?: string | null;

  employeeId?: string | null;

  startDate: string;

  endDate: string;

  trialDays: number;

  extensionCount: number;

  status: TrialStatus;

  remarks?: string | null;

  createdAt: string;

  updatedAt: string;

  lead?: TrialLead | null;

  client?: TrialClient | null;

  /*
   * Old historical product
   */

  product?: TrialProduct | null;

  /*
   * New Settings Demo Product
   */

  demoProduct?: TrialDemoProduct | null;

  employee?: TrialEmployee | null;
}

/* ============================
   START TRIAL REQUEST
============================ */

export interface StartTrialRequest {
  leadId?: string;

  clientId?: string;

  demoProductId: string;

  employeeId?: string;

  trialDays: number;

  remarks?: string;
}

/* ============================
   EXTEND TRIAL REQUEST
============================ */

export interface ExtendTrialRequest {
  trialDays: number;

  remarks?: string;
}

/* ============================
   LIST PARAMS
============================ */

export interface TrialListParams {
  page?: number;

  limit?: number;

  status?: TrialStatus | "";

  search?: string;

  employeeId?: string;
}

/* ============================
   LIST RESPONSE
============================ */

export interface TrialListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  trials: Trial[];
}

/* ============================
   DETAILS RESPONSE
============================ */

export interface TrialDetailsResponse {
  success: boolean;

  trial: Trial;
}

/* ============================
   ACTION RESPONSE
============================ */

export interface TrialActionResponse {
  success: boolean;

  message: string;

  trial: Trial;
}