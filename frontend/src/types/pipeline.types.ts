import type {
  Lead,
} from "./lead.types";

export type PipelineStage =
  | "NEW"
  | "WORKING"
  | "FOLLOW_UP"
  | "CONVERTED"
  | "LOST";

export interface LeadPipeline {
  NEW: Lead[];

  WORKING: Lead[];

  FOLLOW_UP: Lead[];

  CONVERTED: Lead[];

  LOST: Lead[];
}

export interface PipelineCounts {
  NEW: number;

  WORKING: number;

  FOLLOW_UP: number;

  CONVERTED: number;

  LOST: number;
}

export interface LeadPipelineResponse {
  success: boolean;

  total: number;

  counts: PipelineCounts;

  pipeline: LeadPipeline;
}

export interface ChangeLeadStageRequest {
  stage: PipelineStage;

  remarks?: string;
}