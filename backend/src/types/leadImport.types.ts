export interface LeadImportRow {
  name?: string;
  mobile: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
  sourceId?: string;
  remarks?: string;
}

export interface PreviewLeadImportRequest {
  rows: LeadImportRow[];
}

export interface ImportLeadsRequest {
  fileName: string;
  rows: LeadImportRow[];
  assignedEmployeeId?: string;
  sourceId?: string;
}