export interface CreateLeadSourceRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateLeadSourceRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}