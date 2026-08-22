export interface CreateLeadStatusRequest {
  name: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateLeadStatusRequest {
  name?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}