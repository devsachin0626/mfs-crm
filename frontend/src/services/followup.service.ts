import api from "./api";

import type {
  CreateFollowUpPayload,
  FollowUpListResponse,
  FollowUpQuery,
} from "../types/followup.types";

/* ============================
   CREATE FOLLOW UP
============================ */

export const createFollowUp =
  async (
    data:
      CreateFollowUpPayload
  ) => {
    const response =
      await api.post(
        `/leads/${data.leadId}/follow-up`,
        {
          followUpDate:
            data.followUpDate,

          remarks:
            data.remarks,
        }
      );

    return response.data;
  };

/* ============================
   GET FOLLOW UPS
============================ */

export const getFollowUps =
  async (
    params:
      FollowUpQuery = {}
  ): Promise<FollowUpListResponse> => {
    const response =
      await api.get<FollowUpListResponse>(
        "/leads/follow-ups",
        {
          params: {
            page:
              params.page,

            limit:
              params.limit,

            search:
              params.search,

            employeeId:
              params.employeeId,

            view:
              params.view,

            isCompleted:
              params.isCompleted !==
              undefined
                ? String(
                    params.isCompleted
                  )
                : undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   COMPLETE FOLLOW UP
============================ */

export const completeFollowUp =
  async (
    id: string
  ) => {
    const response =
      await api.patch(
        `/leads/follow-ups/${id}/complete`
      );

    return response.data;
  };