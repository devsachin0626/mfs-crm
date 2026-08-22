import {
  CallOutcome,
} from "@prisma/client";

export interface CreateLeadRequest {
  name?: string;

  mobile: string;

  email?: string;

  city?: string;

  state?: string;

  address?: string;

  sourceId?: string;

  remarks?: string;

  assignedEmployeeId?: string;
}

export interface UpdateLeadRequest {
  name?: string;

  mobile?: string;

  alternateMobile?: string;

  email?: string;

  city?: string;

  state?: string;

  source?: string;

  productInterested?: string;

  remarks?: string;

  assignedEmployeeId?: string;

  status?: string;
}

export interface LeadQuery {
  page?: number;
  limit?: number;
  search?: string;

  status?: string;
  employeeId?: string;
  source?: string;

  stage?: string;

  followUp?: "TODAY" | "OVERDUE";


  smartView?:
  | "MY_NEW"
  | "HOT"
  | "OVERDUE"
  | "UNASSIGNED"
  | "NO_FOLLOW_UP"
  | "CONVERTED"
  | "LOST";
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

  stage?: "NEW" | "WORKING" | "FOLLOW_UP" | "CONVERTED" | "LOST";

  nextFollowUp?: Date;

  remarks?: string;
}

export interface AssignLeadRequest {
  employeeId: string;
   
  reason?: string;
}

export interface ChangeLeadStatusRequest {
  statusId: string;
  remarks?: string;
}


export interface CreateFollowUpRequest {
  followUpDate: Date;
  remarks?: string;
}

export interface UpdateFollowUpRequest {
  followUpDate?: Date;
  remarks?: string;
  isCompleted?: boolean;
}
export interface FollowUpQuery {
  page?: number;
  limit?: number;

  search?: string;

  employeeId?: string;

  isCompleted?: string;

  view?:
    | "TODAY"
    | "OVERDUE"
    | "UPCOMING";
}

export interface SaveCallOutcomeRequest {
  outcome: CallOutcome;

  statusId?: string;

  remarks?: string;

  followUpDate?: string;
}

export type LeadTimelineType =
  | "CALL"
  | "STATUS"
  | "FOLLOW_UP"
  | "FOLLOW_UP_COMPLETED"
  | "ASSIGNMENT"
  | "CONVERSION";

export interface LeadTimelineItem {
  id: string;

  type: LeadTimelineType;

  title: string;

  description?: string;

  createdAt: Date;

  employee?: {
    id: string;
    employeeCode: string;
    name: string;
  } | null;

  meta?: Record<string, any>;
}

import {
  LeadStage,
} from "@prisma/client";

export interface ChangeLeadStageRequest {
  stage: LeadStage;
  remarks?: string;
}



export interface BulkLeadIdsRequest {
  leadIds: string[];
}

export interface BulkAssignLeadRequest {
  leadIds: string[];
  employeeId: string;
  reason?: string;
}

export interface BulkChangeStageRequest {
  leadIds: string[];
  stage: LeadStage;
  remarks?: string;
}

export interface BulkChangeStatusRequest {
  leadIds: string[];
  statusId: string;
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

  nextFollowUp?: Date | null;

  reason: string;
}
