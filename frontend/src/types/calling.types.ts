export type CallOutcome =
  | "CONNECTED"
  | "NO_ANSWER"
  | "BUSY"
  | "CALL_BACK"
  | "INTERESTED"
  | "DEMO"
  | "NOT_INTERESTED"
  | "WRONG_NUMBER";

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