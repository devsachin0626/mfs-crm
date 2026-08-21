/* ============================
   FOLLOW UP VIEW
============================ */

export type FollowUpView =
  | "TODAY"
  | "OVERDUE"
  | "UPCOMING";

/* ============================
   EMPLOYEE
============================ */

export interface FollowUpEmployee {
  id: string;

  employeeCode: string;

  name: string;
}

/* ============================
   LEAD STATUS
============================ */

export interface FollowUpLeadStatus {
  id: string;

  name: string;

  color?: string | null;
}

/* ============================
   LEAD
============================ */

export interface FollowUpLead {
  id: string;

  leadCode: string;

  name?: string | null;

  mobile: string;

  email?: string | null;

  city?: string | null;

  status?: FollowUpLeadStatus | null;

  assignedEmployee?:
    | FollowUpEmployee
    | null;
}

/* ============================
   FOLLOW UP
============================ */

export interface FollowUp {
  id: string;

  leadId: string;

  employeeId?: string | null;

  followUpDate: string;

  remarks?: string | null;

  isCompleted: boolean;

  createdAt: string;

  updatedAt: string;

  lead: FollowUpLead;

  employee?:
    | FollowUpEmployee
    | null;
}

/* ============================
   FOLLOW UP QUERY
============================ */

export interface FollowUpQuery {
  page?: number;

  limit?: number;

  search?: string;

  employeeId?: string;

  isCompleted?: boolean;

  view?: FollowUpView;
}

/* ============================
   FOLLOW UP LIST RESPONSE
============================ */

export interface FollowUpListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  followUps: FollowUp[];
}