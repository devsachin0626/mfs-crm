export type LeadStage =
  | "NEW"
  | "WORKING"
  | "FOLLOW_UP"
  | "CONVERTED"
  | "LOST";

export type LeadFollowUpFilter =
  | "TODAY"
  | "OVERDUE";

export interface LeadStatus {
  id: string;

  name: string;

  color?: string | null;

  sortOrder?: number;

  isActive?: boolean;
}

export interface LeadSource {
  id: string;

  name: string;

  description?: string | null;

  isActive?: boolean;
}

export interface LeadEmployee {
  id: string;

  employeeCode: string;

  name: string;

  mobile?: string | null;

  email?: string | null;
}


export interface LeadAssignmentEmployee {
  id: string;
  employeeCode: string;
  name: string;
}

export interface LeadAssignmentHistory {
  id: string;
  leadId: string;

  fromEmployeeId?: string | null;
  fromEmployee?: LeadAssignmentEmployee | null;

  toEmployeeId: string;
  toEmployee: LeadAssignmentEmployee;

  reason?: string | null;

  createdAt: string;
}

export interface Lead {
  id: string;

  leadCode: string;

  name?: string | null;

  mobile: string;

  email?: string | null;

  city?: string | null;

  state?: string | null;

  address?: string | null;

  sourceId?: string | null;

  source?: LeadSource | null;

  statusId: string;

  status: LeadStatus;

  assignedEmployeeId?:
    | string
    | null;

  assignedEmployee?:
    | LeadEmployee
    | null;

  assignmentHistory?: LeadAssignmentHistory[];

  stage: LeadStage;

  isDuplicate?: boolean;

  isConverted?: boolean;

  lastCallAt?: string | null;

  nextFollowUp?:
    | string
    | null;

  remarks?: string | null;

  aging?: LeadAgingInfo;

  createdAt: string;

  updatedAt?: string;
}

export interface LeadQuery {
  page?: number;

  limit?: number;

  search?: string;

  status?: string;

  employeeId?: string;

  source?: string;

  stage?: string;

  followUp?:
    | LeadFollowUpFilter;

    smartView?:
  | "MY_NEW"
  | "HOT"
  | "OVERDUE"
  | "UNASSIGNED"
  | "NO_FOLLOW_UP"
  | "CONVERTED"
  | "LOST";
}

export interface LeadListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  leads: Lead[];
}

export interface LeadDetailsResponse {
  success: boolean;

  lead: Lead;
}

export interface CreateLeadRequest {
  name?: string;

  mobile: string;

  email?: string;

  city?: string;

  state?: string;

  address?: string;

  sourceId?: string;

  assignedEmployeeId?: string;

  remarks?: string;
}

export interface UpdateLeadRequest {
  name?: string;

  mobile?: string;

  email?: string;

  city?: string;

  state?: string;

  address?: string;

  sourceId?: string;

  statusId?: string;

  assignedEmployeeId?: string;

  stage?: LeadStage;

  nextFollowUp?: string;

  remarks?: string;
}

export type LeadAgingLabel =
  | "HOT"
  | "WARM"
  | "COLD"
  | "STALE"
  | "NEW";

export interface LeadAgingInfo {
  label: LeadAgingLabel;

  daysInactive: number;

  isOverdue: boolean;

  nextFollowUp?:
    | string
    | null;

  reason: string;
}

export interface LeadSummary {
  total: number;

  new: number;

  working: number;

  followUp: number;

  converted: number;

  lost: number;

  todayFollowUps: number;

  overdueFollowUps: number;

  myLeads: number;

  unassigned: number;
}

export interface LeadSummaryResponse {
  success: boolean;

  summary:
    LeadSummary;
}