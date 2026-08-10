export interface CreateImportBatchRequest {
  fileName: string;
  totalRecords: number;
  importedById: string;
  imported?: number;
  duplicates?: number;
  failed?: number;
}

export interface UpdateImportBatchRequest {
  fileName?: string;
  totalRecords?: number;
  imported?: number;
  duplicates?: number;
  failed?: number;
  importedById?: string;
}