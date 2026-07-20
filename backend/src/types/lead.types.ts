export interface CreateLeadRequest {
  name?: string;

  mobile: string;

  email?: string;

  city?: string;

  state?: string;

  address?: string;

  sourceId?: string;

  remarks?: string;

  assignedEmployeeId?: string;
}

export interface UpdateLeadRequest {
  name?: string;

  mobile?: string;

  alternateMobile?: string;

  email?: string;

  city?: string;

  state?: string;

  source?: string;

  productInterested?: string;

  remarks?: string;

  assignedEmployeeId?: string;

  status?: string;
}

export interface LeadQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  employeeId?: string;
  source?: string;
}

export interface UpdateLeadRequest {
  name?: string;
  mobile?: string;
  email?: string;

  city?: string;
  state?: string;
  address?: string;

  sourceId?: string;
  statusId?: string;

  assignedEmployeeId?: string;

  stage?: "NEW" | "WORKING" | "FOLLOW_UP" | "CONVERTED" | "LOST";

  nextFollowUp?: Date;

  remarks?: string;
}

export interface AssignLeadRequest {
  employeeId: string;
}

export interface ChangeLeadStatusRequest {
  statusId: string;
  remarks?: string;
}


export interface CreateFollowUpRequest {
  followUpDate: Date;
  remarks?: string;
}

export interface UpdateFollowUpRequest {
  followUpDate?: Date;
  remarks?: string;
  isCompleted?: boolean;
}

export interface FollowUpQuery {
  page?: string;
  limit?: string;
  search?: string;
  employeeId?: string;
  isCompleted?: string;
}

