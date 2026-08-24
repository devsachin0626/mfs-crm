export type FollowUpView =
  | "TODAY"
  | "OVERDUE"
  | "UPCOMING";

export interface FollowUpEmployee {
  id: string;
  employeeCode: string;
  name: string;
}

export interface FollowUpLeadStatus {
  id: string;
  name: string;
  color?: string | null;
}

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

export interface CreateFollowUpPayload {
  leadId: string;

  followUpDate: string;

  remarks?: string;
}

export interface FollowUpQuery {
  page?: number;

  limit?: number;

  search?: string;

  employeeId?: string;

  isCompleted?: boolean;

  view?: FollowUpView;
}

export interface FollowUpListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  followUps: FollowUp[];
}