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

   Optional:
   Existing client may also
   receive a product demo.
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
   PRODUCT
============================ */

export interface TrialProduct {
  id: string;

  productCode: string;

  name: string;

  type?: string;

  price?: number | string;

  durationDays?: number | null;

  isTrialAvailable?: boolean;
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

  /*
   * Normal CRM flow:
   *
   * Lead -> Demo / Trial
   *
   * Client is NOT required.
   */

  leadId?: string | null;

  clientId?: string | null;

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

  lead?: TrialLead | null;

  client?: TrialClient | null;

  product?: TrialProduct;

  employee?: TrialEmployee | null;
}

/* ============================
   START TRIAL
============================ */

export interface StartTrialRequest {
  /*
   * Normal case:
   * leadId will be sent.
   */

  leadId?: string;

  /*
   * Optional future/direct case:
   * existing Client demo.
   */

  clientId?: string;

  productId: string;

  employeeId?: string;

  trialDays: number;

  remarks?: string;
}

/* ============================
   EXTEND TRIAL
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

  leadId?: string;

  clientId?: string;

  productId?: string;
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