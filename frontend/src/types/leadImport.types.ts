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

export interface LeadImportPreviewRow
  extends LeadImportRow {
  rowNumber: number;

  errors: string[];

  fileDuplicate: boolean;

  databaseDuplicate: boolean;

  isValid: boolean;

  duplicateLead?: {
    id: string;
    leadCode: string;
    mobile: string;
    name?: string | null;
  } | null;
}

export interface LeadImportPreviewResponse {
  success: boolean;

  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
  };

  rows:
    LeadImportPreviewRow[];
}

export interface LeadImportResponse {
  success: boolean;

  message: string;

  batch: {
    id: string;
    fileName: string;
    totalRecords: number;
    imported: number;
    duplicates: number;
    failed: number;
    createdAt: string;
  };

  summary: {
    total: number;
    imported: number;
    duplicates: number;
    failed: number;
  };
}