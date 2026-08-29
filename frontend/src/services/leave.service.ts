import api from "./api";

import type {
  ApplyLeavePayload,
  LeaveListResponse,
  LeaveQuery,
} from "../types/leave.types";

/* ============================
   GET LEAVES
============================ */

export const getLeaves = async (
  params: LeaveQuery
): Promise<LeaveListResponse> => {
  const response =
    await api.get(
      "/leaves",
      {
        params,
      }
    );

  return response.data;
};

/* ============================
   GET LEAVE BY ID
============================ */

export const getLeaveById =
  async (
    id: string
  ) => {
    const response =
      await api.get(
        `/leaves/${id}`
      );

    return response.data;
  };

/* ============================
   APPLY LEAVE

   employeeId backend token
   se decide karega
============================ */

export const applyLeave =
  async (
    data: ApplyLeavePayload
  ) => {
    const response =
      await api.post(
        "/leaves",
        data
      );

    return response.data;
  };

/* ============================
   UPDATE LEAVE
   ADMIN / HR
============================ */

export const updateLeave =
  async (
    id: string,
    data: {
      fromDate?: string;
      toDate?: string;
      reason?: string;
    }
  ) => {
    const response =
      await api.put(
        `/leaves/${id}`,
        data
      );

    return response.data;
  };

/* ============================
   APPROVE / REJECT

   approvedById mat bhejo.
   Backend authenticated
   employee use karega.
============================ */

export const approveRejectLeave =
  async (
    id: string,
    status:
      | "APPROVED"
      | "REJECTED"
  ) => {
    const response =
      await api.put(
        `/leaves/${id}/approve`,
        {
          status,
        }
      );

    return response.data;
  };