import api from "./api";

import type {
  BulkActionResponse,
  BulkAssignRequest,
  BulkStageRequest,
  BulkStatusRequest,
} from "../types/leadBulk.types";

export const bulkAssignLeads =
  async (
    data: BulkAssignRequest
  ): Promise<BulkActionResponse> => {
    const response =
      await api.patch<BulkActionResponse>(
        "/leads/bulk/assign",
        data
      );

    return response.data;
  };

export const bulkChangeLeadStage =
  async (
    data: BulkStageRequest
  ): Promise<BulkActionResponse> => {
    const response =
      await api.patch<BulkActionResponse>(
        "/leads/bulk/stage",
        data
      );

    return response.data;
  };

export const bulkChangeLeadStatus =
  async (
    data: BulkStatusRequest
  ): Promise<BulkActionResponse> => {
    const response =
      await api.patch<BulkActionResponse>(
        "/leads/bulk/status",
        data
      );

    return response.data;
  };