import api from "./api";

import type {
  ChangeLeadStageRequest,
  LeadPipelineResponse,
} from "../types/pipeline.types";

export const getLeadPipeline =
  async (
    params?: {
      employeeId?: string;

      search?: string;
    }
  ): Promise<LeadPipelineResponse> => {
    const response =
      await api.get<LeadPipelineResponse>(
        "/leads/pipeline/view",
        {
          params,
        }
      );

    return response.data;
  };

export const changeLeadStage =
  async (
    leadId: string,
    data: ChangeLeadStageRequest
  ) => {
    const response =
      await api.patch(
        `/leads/${leadId}/stage`,
        data
      );

    return response.data;
  };