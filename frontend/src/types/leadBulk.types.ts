import type {
  LeadStage,
} from "./lead.types";

export interface BulkActionResponse {
  success: boolean;

  message: string;

  updated: number;

  skipped: number;
}

export interface BulkAssignRequest {
  leadIds: string[];

  employeeId: string;

  reason?: string;
}

export interface BulkStageRequest {
  leadIds: string[];

  stage: LeadStage;

  remarks?: string;
}

export interface BulkStatusRequest {
  leadIds: string[];

  statusId: string;

  remarks?: string;
}