import api from "./api";

import type {
  LeadImportPreviewResponse,
  LeadImportResponse,
  LeadImportRow,
} from "../types/leadImport.types";

export const previewLeadImport =
  async (
    rows: LeadImportRow[]
  ): Promise<LeadImportPreviewResponse> => {
    const response =
      await api.post<LeadImportPreviewResponse>(
        "/leads/import/preview",
        {
          rows,
        }
      );

    return response.data;
  };

export const importLeads =
  async (
    data: {
      fileName: string;

      rows:
        LeadImportRow[];

      assignedEmployeeId?: string;

      sourceId?: string;
    }
  ): Promise<LeadImportResponse> => {
    const response =
      await api.post<LeadImportResponse>(
        "/leads/import",
        data
      );

    return response.data;
  };

export const getImportBatches =
  async () => {
    const response =
      await api.get(
        "/leads/import/batches"
      );

    return response.data;
  };