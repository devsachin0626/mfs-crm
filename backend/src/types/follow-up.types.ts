export interface CreateFollowUpRequest {
  leadId: string;
  employeeId?: string;
  followUpDate: string;
  remarks?: string;
  isCompleted?: boolean;
}

export interface UpdateFollowUpRequest {
  leadId?: string;
  employeeId?: string;
  followUpDate?: string;
  remarks?: string;
  isCompleted?: boolean;
}