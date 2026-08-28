import api from "./api";

/* ============================
   TYPES
============================ */

export interface LeadSourcePayload {
  name: string;

  description?: string | null;

  isActive?: boolean;
}

/* ============================
   GET ALL LEAD SOURCES
============================ */

export const getLeadSources =
  async (
    options?: {
      includeInactive?: boolean;
    }
  ) => {
    const response =
      await api.get(
        "/lead-sources",
        {
          params: {
            page: 1,

            limit: 100,

            ...(options
              ?.includeInactive
              ? {}
              : {
                  isActive:
                    true,
                }),
          },
        }
      );

    return response.data;
  };

/* ============================
   GET SOURCE BY ID
============================ */

export const getLeadSourceById =
  async (
    id: string
  ) => {
    const response =
      await api.get(
        `/lead-sources/${id}`
      );

    return response.data;
  };

/* ============================
   CREATE SOURCE
============================ */

export const createLeadSource =
  async (
    data: LeadSourcePayload
  ) => {
    const response =
      await api.post(
        "/lead-sources",
        data
      );

    return response.data;
  };

/* ============================
   UPDATE SOURCE
============================ */

export const updateLeadSource =
  async (
    id: string,
    data:
      Partial<LeadSourcePayload>
  ) => {
    const response =
      await api.put(
        `/lead-sources/${id}`,
        data
      );

    return response.data;
  };

/* ============================
   DELETE SOURCE
============================ */

export const deleteLeadSource =
  async (
    id: string
  ) => {
    const response =
      await api.delete(
        `/lead-sources/${id}`
      );

    return response.data;
  };

/* ============================
   SERVICE
============================ */

const leadSourceService = {
  getLeadSources,

  getLeadSourceById,

  createLeadSource,

  updateLeadSource,

  deleteLeadSource,
};

export default leadSourceService;