export type CallOutcome = string;

export interface CallOutcomeOption {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  leadStatusId?: string | null;
  leadStatus?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
  requiresFollowUp: boolean;
  marksLeadLost: boolean;
  sortOrder: number;
  isActive: boolean;
  isSystem: boolean;
}

export interface CallOutcomePayload {
  name: string;
  description?: string | null;
  color?: string | null;
  leadStatusId?: string | null;
  requiresFollowUp?: boolean;
  marksLeadLost?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SaveCallOutcomeRequest {
  outcome: CallOutcome;

  statusId?: string;

  remarks?: string;

  followUpDate?: string;
}

export interface CallingEmployee {
  id: string;

  employeeCode: string;

  name: string;
}

export interface DailyCallingSummary {
  success: boolean;

  employee:
    CallingEmployee;

  date: string;

  summary: {
    todayCalls: number;

    dailyTarget: number;

    remaining: number;

    achievementPercent: number;

    outcomes: Record<
      string,
      number
    >;
  };
}

export type CallingQueueType =
  | "OVERDUE"
  | "TODAY"
  | "NEW"
  | "GENERAL";

export interface CallingQueueLead {
  id: string;

  leadCode: string;

  name?: string | null;

  mobile: string;

  email?: string | null;

  city?: string | null;

  state?: string | null;

  stage: string;

  nextFollowUp?: string | null;

  lastCallAt?: string | null;

  queueType:
    CallingQueueType;

  priority: number;

  aging?: any;

  status?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;

  source?: {
    id: string;
    name: string;
  } | null;

  assignedEmployee?: {
    id: string;
    employeeCode: string;
    name: string;
  } | null;
}

export interface CallingQueueResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  queue:
    CallingQueueLead[];
}
