import api from "./api";

import type {
  EmployeeDetails,
  EmployeeListResponse,
  EmployeeQuery,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "../types/employee.types";

/* ============================
   GET EMPLOYEES
============================ */

export const getEmployees =
  async (
    params: EmployeeQuery = {}
  ): Promise<EmployeeListResponse> => {
    const response =
      await api.get<EmployeeListResponse>(
        "/employees",
        {
          params,
        }
      );

    return response.data;
  };

/* ============================
   GET ALL EMPLOYEES
   SETTINGS / MANAGER DROPDOWN
============================ */

export const getAllEmployees =
  async (
    search?: string
  ): Promise<EmployeeListResponse> => {
    const response =
      await api.get<EmployeeListResponse>(
        "/employees",
        {
          params: {
            page: 1,

            limit: 500,

            search:
              search?.trim() ||
              undefined,
          },
        }
      );

    return response.data;
  };

/* ============================
   GET EMPLOYEE BY ID
============================ */

export const getEmployeeById =
  async (
    id: string
  ): Promise<{
    success: boolean;

    employee:
      EmployeeDetails;
  }> => {
    const response =
      await api.get(
        `/employees/${id}`
      );

    return response.data;
  };

/* ============================
   CREATE EMPLOYEE
============================ */

export const createEmployee =
  async (
    data:
      CreateEmployeePayload
  ) => {
    const response =
      await api.post(
        "/employees",
        data
      );

    return response.data;
  };

/* ============================
   UPDATE EMPLOYEE
============================ */

export const updateEmployee =
  async (
    id: string,
    data:
      UpdateEmployeePayload
  ) => {
    const response =
      await api.put(
        `/employees/${id}`,
        data
      );

    return response.data;
  };

/* ============================
   DEACTIVATE EMPLOYEE
============================ */

export const deactivateEmployee =
  async (
    id: string
  ) => {
    const response =
      await api.patch(
        `/employees/${id}/deactivate`
      );

    return response.data;
  };

/* ============================
   RESTORE EMPLOYEE
============================ */

export const restoreEmployee =
  async (
    id: string
  ) => {
    const response =
      await api.patch(
        `/employees/${id}/restore`
      );

    return response.data;
  };

/* ============================
   RESET EMPLOYEE PASSWORD
============================ */

export const resetEmployeePassword =
  async (
    id: string,
    newPassword: string
  ) => {
    const response =
      await api.patch(
        `/employees/${id}/reset-password`,
        {
          newPassword,
        }
      );

    return response.data;
  };

/* ============================
   GET BRANCHES
============================ */

export const getBranches =
  async () => {
    const response =
      await api.get(
        "/branches"
      );

    return response.data;
  };

/* ============================
   GET ROLES
============================ */

export const getRoles =
  async () => {
    const response =
      await api.get(
        "/roles"
      );

    return response.data;
  };

/* ============================
   SERVICE OBJECT
============================ */

const employeeService = {
  getEmployees,

  getAllEmployees,

  getEmployeeById,

  createEmployee,

  updateEmployee,

  deactivateEmployee,

  restoreEmployee,

  resetEmployeePassword,

  getBranches,

  getRoles,
};

export default employeeService;