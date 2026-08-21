export type LeadTimelineType =
  | "CALL"
  | "STATUS"
  | "FOLLOW_UP"
  | "FOLLOW_UP_COMPLETED"
  | "ASSIGNMENT"
  | "CONVERSION";

export interface TimelineEmployee {
  id: string;

  employeeCode: string;

  name: string;
}

export interface LeadTimelineItem {
  id: string;

  type: LeadTimelineType;

  title: string;

  description?: string;

  createdAt: string;

  employee?: TimelineEmployee | null;

  meta?: Record<string, any>;
}

export interface LeadTimelineResponse {
  success: boolean;

  total: number;

  timeline: LeadTimelineItem[];
}