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
   API
============================ */

const TRIAL_URL =
  "/trials";

/* ============================
   GET TRIALS
============================ */

export const getTrials =
  async (
    params: TrialListParams = {}
  ): Promise<TrialListResponse> => {
    const response =
      await api.get<TrialListResponse>(
        TRIAL_URL,
        {
          params: {
            page:
              params.page ?? 1,

            limit:
              params.limit ?? 10,

            status:
              params.status ||
              undefined,

            search:
              params.search
                ?.trim() ||
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
    if (!id) {
      throw new Error(
        "Trial ID Is Required"
      );
    }

    const response =
      await api.get<TrialDetailsResponse>(
        `${TRIAL_URL}/${id}`
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
    if (
      !data.leadId &&
      !data.clientId
    ) {
      throw new Error(
        "Lead Or Client Is Required"
      );
    }

    if (
      !data.demoProductId
    ) {
      throw new Error(
        "Demo Product Is Required"
      );
    }

    const trialDays =
      Number(
        data.trialDays
      );

    if (
      !Number.isInteger(
        trialDays
      ) ||
      trialDays <= 0 ||
      trialDays > 365
    ) {
      throw new Error(
        "Trial Days Must Be Between 1 And 365"
      );
    }

    const payload:
      StartTrialRequest = {
        demoProductId:
          data.demoProductId,

        trialDays,

        leadId:
          data.leadId ||
          undefined,

        clientId:
          data.clientId ||
          undefined,

        employeeId:
          data.employeeId ||
          undefined,

        remarks:
          data.remarks
            ?.trim() ||
          undefined,
      };

    const response =
      await api.post<TrialActionResponse>(
        TRIAL_URL,
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
    if (!id) {
      throw new Error(
        "Trial ID Is Required"
      );
    }

    const trialDays =
      Number(
        data.trialDays
      );

    if (
      !Number.isInteger(
        trialDays
      ) ||
      trialDays <= 0 ||
      trialDays > 365
    ) {
      throw new Error(
        "Trial Days Must Be Between 1 And 365"
      );
    }

    const response =
      await api.patch<TrialActionResponse>(
        `${TRIAL_URL}/${id}/extend`,
        {
          trialDays,

          remarks:
            data.remarks
              ?.trim() ||
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
    if (!id) {
      throw new Error(
        "Trial ID Is Required"
      );
    }

    const response =
      await api.patch<TrialActionResponse>(
        `${TRIAL_URL}/${id}/complete`
      );

    return response.data;
  };