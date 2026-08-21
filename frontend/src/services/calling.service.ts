import api from "./api";

import type {
  DailyCallingSummary,
  SaveCallOutcomeRequest,
} from "../types/calling.types";

/* ============================
   SAVE CALL OUTCOME
============================ */

export const saveCallOutcome = async (
  leadId: string,
  data: SaveCallOutcomeRequest
) => {
  const response = await api.post(
    `/leads/${leadId}/call-outcome`,
    data
  );

  return response.data;
};

/* ============================
   GET DAILY CALLING SUMMARY
============================ */

export const getDailyCallingSummary = async (
  employeeId?: string
): Promise<DailyCallingSummary> => {
  const response =
    await api.get<DailyCallingSummary>(
      "/leads/calling-summary",
      {
        params: {
          employeeId,
        },
      }
    );

  return response.data;
};

export const convertLeadToClient = async (
  leadId: string,
  data?: {
    panNumber?: string;
    aadhaarNumber?: string;
  }
) => {
  const response =
    await api.post(
      `/clients/convert/${leadId}`,
      data || {}
    );

  return response.data;
};

