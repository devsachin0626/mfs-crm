import api from "./api";

import type {
  CallOutcomeOption,
  CallOutcomePayload,
} from "../types/calling.types";

export const getCallOutcomes = async (
  includeInactive = false
) => {
  const response = await api.get<{
    success: boolean;
    callOutcomes: CallOutcomeOption[];
  }>("/call-outcomes", {
    params: { includeInactive },
  });

  return response.data;
};

export const createCallOutcome = async (
  payload: CallOutcomePayload
) => (
  await api.post(
    "/call-outcomes",
    payload
  )
).data;

export const updateCallOutcome = async (
  id: string,
  payload: Partial<CallOutcomePayload>
) => (
  await api.put(
    `/call-outcomes/${id}`,
    payload
  )
).data;

export const deleteCallOutcome = async (
  id: string
) => (
  await api.delete(
    `/call-outcomes/${id}`
  )
).data;
