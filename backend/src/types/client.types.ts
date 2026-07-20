export interface CreateClientRequest {
  leadId?: string;

  name: string;
  mobile: string;
  email?: string;

  city?: string;
  state?: string;
  address?: string;

  panNumber?: string;
  aadhaarNumber?: string;

  remarks?: string;
}

export interface UpdateClientRequest {
  name?: string;
  mobile?: string;
  email?: string;

  city?: string;
  state?: string;
  address?: string;

  panNumber?: string;
  aadhaarNumber?: string;

  isActive?: boolean;

  remarks?: string;
}

export interface ClientQuery {
  page?: string;
  limit?: string;
  search?: string;
  isActive?: string;
}