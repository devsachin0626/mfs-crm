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