import api from "./api";

/* ============================
   TYPES
============================ */

export interface LeadStatusPayload {
  name: string;

  color?: string | null;

  sortOrder?: number;

  isActive?: boolean;
}

/* ============================
   GET ALL LEAD STATUSES
============================ */

export const getLeadStatuses =
  async () => {
    const response =
      await api.get(
        "/lead-statuses"
      );

    return response.data;
  };

/* ============================
   GET STATUS BY ID
============================ */

export const getLeadStatusById =
  async (
    id: string
  ) => {
    const response =
      await api.get(
        `/lead-statuses/${id}`
      );

    return response.data;
  };

/* ============================
   CREATE STATUS
============================ */

export const createLeadStatus =
  async (
    data: LeadStatusPayload
  ) => {
    const response =
      await api.post(
        "/lead-statuses",
        data
      );

    return response.data;
  };

/* ============================
   UPDATE STATUS
============================ */

export const updateLeadStatus =
  async (
    id: string,
    data:
      Partial<LeadStatusPayload>
  ) => {
    const response =
      await api.put(
        `/lead-statuses/${id}`,
        data
      );

    return response.data;
  };

/* ============================
   DELETE STATUS
============================ */

export const deleteLeadStatus =
  async (
    id: string
  ) => {
    const response =
      await api.delete(
        `/lead-statuses/${id}`
      );

    return response.data;
  };

/* ============================
   CHANGE LEAD STATUS
   Existing CRM feature
============================ */

export const changeLeadStatus =
  async (
    leadId: string,
    data: {
      statusId: string;

      remarks: string;
    }
  ) => {
    const response =
      await api.patch(
        `/leads/${leadId}/status`,
        data
      );

    return response.data;
  };

/* ============================
   SERVICE
============================ */

const leadStatusService = {
  getLeadStatuses,

  getLeadStatusById,

  createLeadStatus,

  updateLeadStatus,

  deleteLeadStatus,

  changeLeadStatus,
};

export default leadStatusService;