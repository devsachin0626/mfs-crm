import api from "./api";

import type {
  LeadTimelineResponse,
} from "../types/leadTimeline.types";

export const getLeadTimeline =
  async (
    leadId: string
  ): Promise<LeadTimelineResponse> => {
    const response =
      await api.get<LeadTimelineResponse>(
        `/leads/${leadId}/timeline`
      );

    return response.data;
  };