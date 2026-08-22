import api from "./api";

import type {
  CreateTargetPayload,
  UpdateTargetPayload,
  TargetListResponse,
  TargetQuery,
} from "../types/target.types";

export const getTargets = async (
  params: TargetQuery
): Promise<TargetListResponse> => {
  const response = await api.get(
    "/targets",
    {
      params,
    }
  );

  return response.data;
};

export const getTargetById = async (
  id: string
) => {
  const response = await api.get(
    `/targets/${id}`
  );

  return response.data;
};

export const createTarget = async (
  data: CreateTargetPayload
) => {
  const response = await api.post(
    "/targets",
    data
  );

  return response.data;
};

export const updateTarget = async (
  id: string,
  data: UpdateTargetPayload
) => {
  const response = await api.put(
    `/targets/${id}`,
    data
  );

  return response.data;
};