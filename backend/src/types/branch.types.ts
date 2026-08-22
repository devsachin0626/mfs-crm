export interface CreateBranchRequest {
  name: string;
  branchCode: string;
  address?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
}

export interface UpdateBranchRequest {
  name?: string;
  branchCode?: string;
  address?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
}