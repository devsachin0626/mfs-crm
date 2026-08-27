import api from "./api";

import type {
  ExtendTrialRequest,
  StartTrialRequest,
  TrialActionResponse,
  TrialDetailsResponse,
  TrialListParams,
  TrialListResponse,
} from "../types/trial.types";

/* ============================
   GET TRIALS
============================ */

export const getTrials =
  async (
    params: TrialListParams = {}
  ): Promise<TrialListResponse> => {
    const response =
      await api.get<TrialListResponse>(
        "/trials",
        {
          params: {
            page:
              params.page ??
              1,

            limit:
              params.limit ??
              10,

            status:
              params.status ||
              undefined,

            search:
              params.search?.trim() ||
              undefined,

            employeeId:
              params.employeeId ||
              undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   GET TRIAL DETAILS
============================ */

export const getTrialById =
  async (
    id: string
  ): Promise<TrialDetailsResponse> => {
    const response =
      await api.get<TrialDetailsResponse>(
        `/trials/${id}`
      );

    return response.data;
  };

/* ============================
   START TRIAL
============================ */

export const startTrial =
  async (
    data: StartTrialRequest
  ): Promise<TrialActionResponse> => {
    const payload: StartTrialRequest = {
      clientId:
        data.clientId,

      productId:
        data.productId,

      trialDays:
        Number(
          data.trialDays
        ),

      remarks:
        data.remarks?.trim() ||
        undefined,
    };

    /*
     * employeeId optional hai.
     *
     * EMPLOYEE login:
     * backend employeeId ignore karke
     * self assign karega.
     *
     * ADMIN / HR / TL:
     * selected employee use ho sakta hai.
     */

    if (
      data.employeeId
    ) {
      payload.employeeId =
        data.employeeId;
    }

    const response =
      await api.post<TrialActionResponse>(
        "/trials",
        payload
      );

    return response.data;
  };

/* ============================
   EXTEND TRIAL
============================ */

export const extendTrial =
  async (
    id: string,
    data: ExtendTrialRequest
  ): Promise<TrialActionResponse> => {
    const response =
      await api.patch<TrialActionResponse>(
        `/trials/${id}/extend`,
        {
          trialDays:
            Number(
              data.trialDays
            ),

          remarks:
            data.remarks?.trim() ||
            undefined,
        }
      );

    return response.data;
  };

/* ============================
   COMPLETE TRIAL
============================ */

export const completeTrial =
  async (
    id: string
  ): Promise<TrialActionResponse> => {
    const response =
      await api.patch<TrialActionResponse>(
        `/trials/${id}/complete`
      );

    return response.data;
  };