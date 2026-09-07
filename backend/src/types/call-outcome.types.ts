export interface CallOutcomeInput {
  name: string;
  description?: string | null;
  color?: string | null;
  leadStatusId?: string | null;
  requiresFollowUp?: boolean;
  marksLeadLost?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateCallOutcomeInput =
  Partial<CallOutcomeInput>;
