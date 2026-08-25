import api from "./api";

import type {
  CreateLeadRequest,
  LeadDetailsResponse,
  LeadListResponse,
  LeadQuery,
  LeadSummaryResponse,
  UpdateLeadRequest,
} from "../types/lead.types";

export const getLeads = async (
  params: LeadQuery
): Promise<LeadListResponse> => {
  const response =
    await api.get<LeadListResponse>(
      "/leads",
      {
        params,
        
      }
    );

  return response.data;
};

export const getLeadById =
  async (
    id: string
  ): Promise<LeadDetailsResponse> => {
    const response =
      await api.get<LeadDetailsResponse>(
        `/leads/${id}`
      );

    return response.data;
  };

export const createLead =
  async (
    data: CreateLeadRequest
  ) => {
    const response =
      await api.post(
        "/leads",
        data
      );

    return response.data;
  };

export const updateLead =
  async (
    id: string,
    data: UpdateLeadRequest
  ) => {
    const response =
      await api.put(
        `/leads/${id}`,
        data
      );

    return response.data;
  };
export const assignLead = async (
  id: string,
  employeeId: string,
  reason?: string
) => {
  const response =
    await api.patch(
      `/leads/${id}/assign`,
      {
        employeeId,
        reason,
      }
    );

  return response.data;
};

/* ============================
   GET LEAD SUMMARY
============================ */

export const getLeadSummary =
  async (): Promise<LeadSummaryResponse> => {
    const response =
      await api.get<LeadSummaryResponse>(
        "/leads/summary"
      );

    return response.data;
  };