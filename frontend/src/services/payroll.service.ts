import api from "./api";

import type {
  CreatePayrollPayload,
  UpdatePayrollPayload,
  PayrollListResponse,
  PayrollQuery,
} from "../types/payroll.types";

export const getPayrolls = async (
  params: PayrollQuery
): Promise<PayrollListResponse> => {
  const response = await api.get(
    "/payroll",
    {
      params,
    }
  );

  return response.data;
};

export const getPayrollById = async (
  id: string
) => {
  const response = await api.get(
    `/payroll/${id}`
  );

  return response.data;
};

export const createPayroll = async (
  data: CreatePayrollPayload
) => {
  const response = await api.post(
    "/payroll",
    data
  );

  return response.data;
};

export const updatePayroll = async (
  id: string,
  data: UpdatePayrollPayload
) => {
  const response = await api.put(
    `/payroll/${id}`,
    data
  );

  return response.data;
};