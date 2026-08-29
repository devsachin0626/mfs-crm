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

export interface AllocateLeadPoolRequest {
  employeeId: string;

  quantity: number;

  reason?: string;
}

export interface AllocateLeadPoolResponse {
  success: boolean;

  message: string;

  employee: {
    id: string;

    employeeCode: string;

    name: string;
  };

  requested: number;

  assigned: number;

  availableRemaining: number;
}
