import api from "./api";

import type {
  EmployeeListResponse,
  EmployeeQuery,
  EmployeeDetails,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "../types/employee.types";

export const getEmployees = async (
  params: EmployeeQuery
): Promise<EmployeeListResponse> => {
  const response = await api.get(
    "/employees",
    {
      params,
    }
  );

  return response.data;
};

export const getEmployeeById = async (
  id: string
): Promise<{
  success: boolean;
  employee: EmployeeDetails;
}> => {
  const response = await api.get(
    `/employees/${id}`
  );

  return response.data;
};

export const createEmployee = async (
  data: CreateEmployeePayload
) => {
  const response = await api.post(
    "/employees",
    data
  );

  return response.data;
};

export const updateEmployee = async (
  id: string,
  data: UpdateEmployeePayload
) => {
  const response = await api.put(
    `/employees/${id}`,
    data
  );

  return response.data;
};

export const deactivateEmployee = async (
  id: string
) => {
  const response = await api.patch(
    `/employees/${id}/deactivate`
  );

  return response.data;
};

export const restoreEmployee = async (
  id: string
) => {
  const response = await api.patch(
    `/employees/${id}/restore`
  );

  return response.data;
};

export const getBranches = async () => {
  const response = await api.get("/branches");
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/roles");
  return response.data;
};