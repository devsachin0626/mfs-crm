export interface CreateLeadHistoryRequest {
  leadId: string;
  employeeId?: string;
  statusId?: string;
  remarks?: string;
}

export interface UpdateLeadHistoryRequest {
  leadId?: string;
  employeeId?: string;
  statusId?: string;
  remarks?: string;
}