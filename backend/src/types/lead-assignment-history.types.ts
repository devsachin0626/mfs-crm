export interface CreateLeadAssignmentHistoryRequest {
  leadId: string;
  fromEmployeeId?: string;
  toEmployeeId: string;
  reason?: string;
}

export interface UpdateLeadAssignmentHistoryRequest {
  leadId?: string;
  fromEmployeeId?: string;
  toEmployeeId?: string;
  reason?: string;
}