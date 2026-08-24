import api from "./api";

import type {
  CreateTargetPayload,
  TargetDetailsResponse,
  TargetListResponse,
  TargetQuery,
  UpdateTargetPayload,
} from "../types/target.types";

/* ============================
   GET TARGETS
============================ */

export const getTargets =
  async (
    params: TargetQuery
  ): Promise<TargetListResponse> => {
    const response =
      await api.get(
        "/targets",
        {
          params,
        }
      );

    return response.data;
  };

/* ============================
   GET TARGET BY ID
============================ */

export const getTargetById =
  async (
    id: string
  ): Promise<TargetDetailsResponse> => {
    const response =
      await api.get(
        `/targets/${id}`
      );

    return response.data;
  };

/* ============================
   CREATE TARGET
============================ */

export const createTarget =
  async (
    data: CreateTargetPayload
  ) => {
    const response =
      await api.post(
        "/targets",
        data
      );

    return response.data;
  };

/* ============================
   UPDATE TARGET
============================ */

export const updateTarget =
  async (
    id: string,
    data: UpdateTargetPayload
  ) => {
    const response =
      await api.put(
        `/targets/${id}`,
        data
      );

    return response.data;
  };